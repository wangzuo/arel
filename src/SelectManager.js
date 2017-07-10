import capitalize from 'lodash/capitalize';
import compact from 'lodash/compact';
import isString from 'lodash/isString';
import isEmpty from 'lodash/isEmpty';
import last from 'lodash/last';
import extend from 'lodash/extend';
import flatten from 'lodash/flatten';
import TreeManager from './TreeManager';

class Row {
  constructor(data) {
    this.data = data;
  }

  get id() {
    return data.id;
  }
}

export default class SelectManager extends TreeManager {
  constructor(table = null) {
    super();

    const { default: Crud } = require('./Crud');
    const { SelectStatement } = require('./nodes');

    extend(this, Crud);

    this.ast = new SelectStatement();
    this.ctx = last(this.ast.cores);
    this.from(table);
  }

  get limit() {
    return this.ast.limit && this.ast.limit.expr;
  }

  get taken() {
    return this.limit;
  }

  get constraints() {
    return this.ctx.wheres;
  }

  get offset() {
    return this.ast.offset && this.ast.offset.expr;
  }

  skip(amount) {
    if (amount) {
      const { Offset } = require('./nodes');
      this.ast.offset = new Offset(amount);
    } else {
      this.ast.offset = null;
    }
    return this;
  }

  set offset(amount) {
    return this.skip(amount);
  }

  exists() {
    const { Exists } = require('./nodes');
    return new Exists(this.ast);
  }

  as(other) {
    const { SqlLiteral } = require('./nodes');
    if (isString(other)) {
      other = new SqlLiteral(other);
    }
    return this.createTableAlias(this.grouping(this.ast), other);
  }

  lock(locking) {
    const Arel = require('./Arel');
    const { SqlLiteral, Lock } = require('./nodes');

    locking = locking || Arel.sql('FOR UPDATE');

    if (locking === true) {
      locking = Arel.sql('FOR UPDATE');
    } else if (isString(locking) || locking instanceof SqlLiteral) {
      locking = Arel.sql(locking);
    }

    this.ast.lock = new Lock(locking);
    return this;
  }

  locked() {
    return this.ast.lock;
  }

  on(...exprs) {
    const { On } = require('./nodes');
    last(this.ctx.source.right).right = new On(this.collapse(exprs));
    return this;
  }

  group(...columns) {
    const { SqlLiteral, Group } = require('./nodes');

    columns.forEach(column => {
      if (isString(column)) {
        column = new SqlLiteral(column);
      }
      this.ctx.groups.push(new Group(column));
    });

    return this;
  }

  from(table) {
    const { SqlLiteral, Join } = require('./nodes');
    if (isString(table)) {
      table = new SqlLiteral(table);
    }

    if (table instanceof Join) {
      this.ctx.source.right.push(table);
    } else {
      this.ctx.source.left = table;
    }

    return this;
  }

  get froms() {
    return compact(this.ast.cores.map(x => x.from));
  }

  join(relation, klass) {
    if (!relation) return this;
    const { InnerJon, SqlLiteral, StringJoin } = require('./nodes');
    klass = klass || InnerJon;

    if (isString(relation) || relation instanceof SqlLiteral) {
      if (isEmpty(relation)) throw new Error('empty join error');

      klass = StringJoin;
    }

    this.ctx.source.right.push(this.createJoin(relation, null, klass));

    return this;
  }

  outerJoin(relation) {
    const { OuterJoin } = require('./nodes');
    return this.join(relation, OuterJoin);
  }

  having(expr) {
    this.ctx.havings.push(expr);
    return this;
  }

  window(name) {
    const { NamedWindow } = require('./nodes');
    this.ctx.windows.push(window);
    return window;
  }

  project(...projections) {
    const { SqlLiteral } = require('./nodes');
    this.ctx.projections = this.ctx.projections.concat(
      projections.map(x => (isString(x) ? new SqlLiteral(x) : x))
    );
    return this;
  }

  get projections() {
    return this.ctx.projections;
  }

  set projections(projections) {
    this.ctx.projections = projections;
  }

  distinct(value = true) {
    if (value) {
      const { Distinct } = require('./nodes');
      this.ctx.setQuantifier = new Distinct();
    } else {
      this.ctx.setQuantifier = null;
    }

    return this;
  }

  distinctOn(value) {
    if (value) {
      const { DistinctOn } = require('./nodes');
      this.ctx.setQuantifier = new DistinctOn(value);
    } else {
      this.ctx.setQuantifier = null;
    }

    return this;
  }

  order(...expr) {
    const { SqlLiteral } = require('./nodes');
    this.ast.orders = this.ast.orders.concat(
      expr.map(x => (isString(x) ? new SqlLiteral(x) : x))
    );

    return this;
  }

  get orders() {
    return this.ast.orders;
  }

  whereSql(engine) {
    if (isEmpty(this.ctx.wheres)) return;

    const { Table } = require('./Arel');
    const { WhereSql } = require('./visitors/WhereSql');
    engine = engine || Table.engine;

    const viz = new WhereSql(engine.connection.visitor, engine.connection);
    return new SqlLiteral(viz.accpet(this.ctx, new SQLString())).value;
  }

  union(operation, other = null) {
    if (other) {
      const NodeClass = require('./nodes')[`Union${capitalize(operation)}`];
      return new NodeClass(this.ast, other.ast);
    }

    const { Union } = require('./nodes');
    return new Union(this.ast, operation.ast);
  }

  intersect(other) {
    const { Intersect } = require('./nodes');
    return new Intersect(this.ast, other.ast);
  }

  except(other) {
    const { Except } = require('./nodes');
    return new Except(this.ast, other.ast);
  }

  minus(other) {
    return this.except(other);
  }

  with(...subqueries) {
    const NodeClass = isString(subqueries[0])
      ? require('./nodes')[`With${capitalize(subqueries.shift())}`]
      : require('./nodes').With;

    this.ast.with = new NodeClass(flatten(subqueries));

    return this;
  }

  take(limit) {
    const { Limit, Top } = require('./nodes');
    if (limit) {
      this.ast.limit = new Limit(limit);
      this.ctx.top = new Top(limit);
    } else {
      this.ast.limit = null;
      this.ctx.top = null;
    }
    return this;
  }

  set limit(limit) {
    this.take(limit);
  }

  get joinSources() {
    return this.ctx.source.right;
  }

  get source() {
    return this.ctx.source;
  }

  // private

  collapse(exprs, existing = null) {
    if (existing) {
      exprs = exprs.unshift(existing.exprs);
    }

    const { SqlLiteral } = require('./nodes');
    exprs = compact(exprs).map(
      expr => (isString(expr) ? new SqlLiteral(expr) : expr)
    );
    if (exprs.length === 1) {
      return exprs[0];
    } else {
      return this.createAnd(exprs);
    }
  }
}
