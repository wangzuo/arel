import trimEnd from 'lodash/trimEnd';
import isArray from 'lodash/isArray';
import isString from 'lodash/isString';
import isEmpty from 'lodash/isEmpty';
import forEach from 'lodash/forEach';
import isNull from 'lodash/isNull';
import Reduce from './Reduce';
import SQLString from '../collectors/SQLString';

export const WHERE = ' WHERE ';
export const SPACE = ' ';
export const COMMA = ', ';
export const GROUP_BY = ' GROUP BY ';
export const ORDER_BY = ' ORDER BY ';
export const WINDOW = ' WINDOW ';
export const AND = ' AND ';
export const DISTINCT = 'DISTINCT';

export default class ToSql extends Reduce {
  constructor(connection) {
    super();
    this.connection = connection;
  }

  compile(node, block) {
    return this.accept(node, new SQLString(), block).value;
  }

  // private

  visitDeleteStatement(o, collector) {
    collector.append('DELETE FROM ');
    collector = this.visit(o.relation, collector);

    if (o.wheres.length) {
      collector.append(WHERE);
      collector = this.injectJoin(o.wheres, collector, AND);
    }

    return this.maybeVisit(o.limit, collector);
  }

  buildSubselect(key, o) {
    const { SelectStatement } = require('../nodes');
    const stmt = new SelectStatement();
    const core = stmt.cores[0];
    core.froms = o.relation;
    core.wheres = o.wheres;
    core.projections = [key];
    stmt.limit = o.limit;
    stmt.orders = o.orders;
    return stmt;
  }

  visitUpdateStatement(o, collector) {
    const { In } = require('../nodes');
    const wheres =
      isEmpty(o.orders) && isNull(o.limit)
        ? o.wheres
        : [new In(o.key, [this.buildSubselect(o.key, o)])];

    collector.append('UPDATE ');
    collector = this.visit(o.relation, collector);
    if (!isEmpty(o.values)) {
      collector.append(' SET ');
      collector = this.injectJoin(o.values, collector, ', ');
    }

    if (!isEmpty(wheres)) {
      collector.append(' WHERE ');
      collector = this.injectJoin(wheres, collector, ' AND ');
    }

    return collector;
  }

  visitInsertStatement(o, collector) {
    collector.append('INSERT INTO ');
    collector = this.visit(o.relation, collector);

    if (o.columns && o.columns.length) {
      collector.append(
        ` (${o.columns.map(x => this.quoteColumnName(x.name)).join(', ')})`
      );
    }

    if (o.values) {
      return this.maybeVisit(o.values, collector);
    } else if (o.select) {
      return this.maybeVisit(o.select, collector);
    }

    return collector;
  }

  visitExists(o, collector) {
    collector.append('EXISTS (');
    collector = this.visit(o.expressions, collector).append(')');
    if (o.alias) {
      collector.append(' AS ');
      return this.visit(o.alias, collector);
    }
    return collector;
  }

  visitCasted(o, collector) {
    return collector.append(this.quoted(o.val, o.attribute).toString());
  }

  visitQuoted(o, collector) {
    return collector.append(this.quoted(o.expr, null).toString());
  }

  visitSelectStatement(o, collector) {
    if (o.with) {
      collector = this.visit(o.with, collector);
      collector.append(SPACE);
    }

    collector = o.cores.reduce((c, x) => this.visitSelectCore(x, c), collector);

    if (o.orders && o.orders.length) {
      collector.append(ORDER_BY);
      const len = o.orders.length - 1;
      o.orders.forEach((x, i) => {
        collector = this.visit(x, collector);
        if (len !== i) {
          collector.append(COMMA);
        }
      });
    }

    this.visitSelectOptions(o, collector);

    return collector;
  }

  visitSelectCore(o, collector) {
    collector.append('SELECT');
    collector = this.maybeVisit(o.top, collector);
    collector = this.maybeVisit(o.setQuantifier, collector);

    this.collectNodesFor(o.projections, collector, SPACE);

    if (o.source && !o.source.isEmpty()) {
      collector.append(' FROM ');
      collector = this.visit(o.source, collector);
    }

    this.collectNodesFor(o.wheres, collector, WHERE, AND);
    this.collectNodesFor(o.groups, collector, GROUP_BY);

    if (!isEmpty(o.havings)) {
      collector.append(' HAVING ');
      this.injectJoin(o.havings, collector, AND);
    }

    this.collectNodesFor(o.windows, collector, WINDOW);

    return collector;
  }

  collectNodesFor(nodes, collector, spacer, connector = COMMA) {
    if (nodes && nodes.length) {
      collector.append(spacer);
      const len = nodes.length - 1;
      nodes.forEach((x, i) => {
        collector = this.visit(x, collector);
        if (len !== i) {
          collector.append(connector);
        }
      });
    }
  }

  visitSelectOptions(o, collector) {
    collector = this.maybeVisit(o.limit, collector);
    collector = this.maybeVisit(o.offset, collector);
    collector = this.maybeVisit(o.lock, collector);
    return collector;
  }

  visitBindParam(o, collector) {
    return collector.addBind(o, () => '?');
  }

  visitTable(o, collector) {
    if (o.tableAlias) {
      return collector.append(
        `${this.quoteTableName(o.name)} ${this.quoteTableName(o.tableAlias)}`
      );
    }

    return collector.append(this.quoteTableName(o.name));
  }

  visitSelectManager(o, collector) {
    return collector.append(`(${trimEnd(o.toSql())})`);
  }

  // def literal o, collector; collector << o.to_s; end
  literal(o, collector) {
    return collector.append(o.toString());
  }

  visitSqlLiteral(o, collector) {
    return this.literal(o, collector);
  }

  visitCount(o, collector) {
    return this.aggregate('COUNT', o, collector);
  }

  visitSum(o, collector) {
    return this.aggregate('SUM', o, collector);
  }

  visitOffset(o, collector) {
    collector.append('OFFSET ');
    return this.visit(o.expr, collector);
  }

  visitNumber(o, collector) {
    return this.literal(o, collector);
  }

  visitAssignment(o, collector) {
    const { UnqualifiedColumn, BindParam } = require('../nodes');
    const { Attribute } = require('../attributes');

    if (
      o.right instanceof UnqualifiedColumn ||
      o.right instanceof Attribute ||
      o.right instanceof BindParam
    ) {
      collector = this.visit(o.left, collector);
      collector.append(' = ');
      return this.visit(o.right, collector);
    } else {
      collector = this.visit(o.left, collector);
      collector.append(' = ');
      collector.append(this.quote(o.right).toString());
    }

    return collector;
  }

  visitUnqualifiedColumn(o, collector) {
    collector.append(this.quoteColumnName(o.name));
    return collector;
  }

  visitGroup(o, collector) {
    return this.visit(o.expr, collector);
  }

  visitTop(o, collector) {
    return collector;
  }

  visitLimit(o, collector) {
    collector.append('LIMIT ');
    return this.visit(o.expr, collector);
  }

  visitValues(o, collector) {
    const { SqlLiteral, BindParam } = require('../nodes');

    collector.append('VALUES (');
    const len = o.expressions.length - 1;
    o.expressions.forEach((value, i) => {
      if (value instanceof SqlLiteral || value instanceof BindParam) {
        collector = this.visit(value, collector);
      } else {
        collector.append(this.quote(value).toString());
      }

      if (i !== len) {
        collector.append(COMMA);
      }
    });

    return collector.append(')');
  }

  visitValuesList(o, collector) {
    const { SqlLiteral, BindParam } = require('../nodes');

    collector.append('VALUES ');
    const len = o.rows.length - 1;
    o.rows.forEach((row, i) => {
      collector.append('(');
      const rowLen = row.length - 1;

      forEach(row, (value, k) => {
        if (value instanceof SqlLiteral || value instanceof BindParam) {
          collector = this.visit(value, collector);
        } else {
          collector.append(this.quote(value));
        }
        if (k !== rowLen) {
          collector.append(COMMA);
        }
      });

      collector.append(')');
      if (i !== len) {
        collector.append(COMMA);
      }
    });

    return collector;
  }

  visitIn(o, collector) {
    if (isArray(o.right) && isEmpty(o.right)) {
      collector.append('1=0');
    } else {
      collector = this.visit(o.left, collector);
      collector.append(' IN (');
      this.visit(o.right, collector).append(')');
    }

    return collector;
  }

  quoted(o, a) {
    if (a && a.ableToTypeCast()) {
      return this.quote(a.typeCastForDatabase(o));
    } else {
      return this.quote(o);
    }
  }

  visitJoinSource(o, collector) {
    if (o.left) {
      collector = this.visit(o.left, collector);
    }

    if (!isEmpty(o.right)) {
      if (o.left) {
        collector.append(SPACE);
      }
      collector = this.injectJoin(o.right, collector, SPACE);
    }

    return collector;
  }

  visitInnerJoin(o, collector) {
    collector.append('INNER JOIN ');
    collector = this.visit(o.left, collector);
    if (o.right) {
      collector.append(SPACE);
      this.visit(o.right, collector);
    }

    return collector;
  }

  visitEquality(o, collector) {
    const right = o.right;
    collector = this.visit(o.left, collector);

    if (isEmpty(right)) {
      collector.append(' IS NULL');
    } else {
      collector.append(' = ');
      this.visit(right, collector);
    }

    return collector;
  }

  visitAttribute(o, collector) {
    const joinName = o.relation.tableAlias || o.relation.name;
    return collector.append(
      `${this.quoteTableName(joinName)}.${this.quoteColumnName(o.name)}`
    );
  }

  visitTableAlias(o, collector) {
    collector = this.visit(o.relation, collector);
    collector.append(' ');
    return collector.append(this.quoteTableName(o.name));
  }

  visitGrouping(o, collector) {
    const { Grouping } = require('../nodes');

    if (o.expr instanceof Grouping) {
      return this.visit(o.expr, collector);
    } else {
      collector.append('(');
      return this.visit(o.expr, collector).append(')');
    }
  }

  visitAnd(o, collector) {
    return this.injectJoin(o.children, collector, ' AND ');
  }

  visitFunc(o, collector) {
    collector.append(o.name);
    collector.append('(');
    if (o.distinct) collector.append('DISTINCT ');
    collector = this.injectJoin(o.expressions, collector, ', ').append(')');
    if (o.alias) {
      collector.append(' AS ');
      return this.visit(o.alias, collector);
    } else {
      return collector;
    }
  }

  visitOn(o, collector) {
    collector.append('ON ');
    return this.visit(o.expr, collector);
  }

  visitUnion(o, collector) {
    collector.append('( ');
    return this.infixValue(o, collector, ' UNION ').append(' )');
  }

  visitLessThan(o, collector) {
    collector = this.visit(o.left, collector);
    collector.append(' < ');
    return this.visit(o.right, collector);
  }

  visitGreaterThan(o, collector) {
    collector = this.visit(o.left, collector);
    collector.append(' > ');
    return this.visit(o.right, collector);
  }

  visitUnionAll(o, collector) {
    collector.append('( ');
    return this.infixValue(o, collector, ' UNION ALL ').append(' )');
  }

  visitIntersect(o, collector) {
    collector.append('( ');
    return this.infixValue(o, collector, ' INTERSECT ').append(' )');
  }

  visitExcept(o, collector) {
    collector.append('( ');
    return this.infixValue(o, collector, ' EXCEPT ').append(' )');
  }

  visitBetween(o, collector) {
    collector = this.visit(o.left, collector);
    collector.append(' BETWEEN ');
    return this.visit(o.right, collector);
  }

  visitWith(o, collector) {
    collector.append('WITH ');
    return this.injectJoin(o.children, collector, COMMA);
  }

  visitAs(o, collector) {
    collector = this.visit(o.left, collector);
    collector.append(' AS ');
    return this.visit(o.right, collector);
  }

  visitWithRecursive(o, collector) {
    collector.append('WITH RECURSIVE ');
    return this.injectJoin(o.children, collector, COMMA);
  }

  visitLock(o, collector) {
    return this.visit(o.expr, collector);
  }

  visitOuterJoin(o, collector) {
    collector.append('LEFT OUTER JOIN ');
    collector = this.visit(o.left, collector);
    collector.append(' ');
    return this.visit(o.right, collector);
  }

  visitStringJoin(o, collector) {
    return this.visit(o.left, collector);
  }

  visitRightOuterJoin(o, collector) {
    collector.append('RIGHT OUTER JOIN ');
    collector = this.visit(o.left, collector);
    collector.append(SPACE);
    return this.visit(o.right, collector);
  }

  visitFullOuterJoin(o, collector) {
    collector.append('FULL OUTER JOIN ');
    collector = this.visit(o.left, collector);
    collector.append(SPACE);
    return this.visit(o.right, collector);
  }

  visitAscending(o, collector) {
    return this.visit(o.expr, collector).append(' ASC');
  }

  visitDescending(o, collector) {
    return this.visit(o.expr, collector).append(' DESC');
  }

  visitNamedWindow(o, collector) {
    collector.append(this.quoteColumnName(o.name));
    collector.append(' AS ');
    return this.visitWindow(o, collector);
  }

  visitWindow(o, collector) {
    collector.append('(');

    if (!isEmpty(o.partitions)) {
      collector.append('PARTITION BY ');
      collector = this.injectJoin(o.partitions, collector, ', ');
    }

    if (!isEmpty(o.orders)) {
      if (!isEmpty(o.partitions)) {
        collector.append(SPACE);
      }
      collector.append('ORDER BY ');
      collector = this.injectJoin(o.orders, collector, ', ');
    }

    if (o.framing) {
      if (!isEmpty(o.partitions) || !isEmpty(o.orders)) {
        collector.append(SPACE);
      }
      collector = this.visit(o.framing, collector);
    }

    return collector.append(')');
  }

  visitRows(o, collector) {
    if (o.expr) {
      collector.append('ROWS ');
      return this.visit(o.expr, collector);
    }

    return this.collector.append('ROWS');
  }

  visitPreceding(o, collector) {
    if (o.expr) {
      return this.visit(o.expr, collector).append(' PRECEDING');
    }

    return collector.append('UNBOUNDED PRECEDING');
  }

  visitRange(o, collector) {
    if (o.expr) {
      collector.append('RANGE ');
      return this.visit(o.expr, collector);
    }

    return collector.append('RANGE');
  }

  visitFollowing(o, collector) {
    if (o.expr) {
      return this.visit(o.expr, collector).append(' FOLLOWING');
    }

    return collector.append('UNBOUNDED FOLLOWING');
  }

  visitCurrentRow(o, collector) {
    return collector.append('CURRENT ROW');
  }

  visitDistinct(o, collector) {
    return collector.append(DISTINCT);
  }

  visitDistinctOn(o, collector) {
    throw new Error('DISTINCT ON not implemented for this db');
  }

  visitLessThanOrEqual(o, collector) {
    collector = this.visit(o.left, collector);
    collector.append(' <= ');
    return this.visit(o.right, collector);
  }

  visitArray(o, collector) {
    return this.injectJoin(o, collector, ', ');
  }

  quote(value) {
    const { SqlLiteral } = require('../nodes');
    if (value instanceof SqlLiteral) return value;
    return this.connection.quote(value);
  }

  quoteTableName(name) {
    const { SqlLiteral } = require('../nodes');
    if (name instanceof SqlLiteral) return name;
    return this.connection.quoteTableName(name);
  }

  quoteColumnName(name) {
    const { SqlLiteral } = require('../nodes');
    if (name instanceof SqlLiteral) return name;
    return this.connection.quoteColumnName(name);
  }

  maybeVisit(thing, collector) {
    if (!thing) return collector;
    collector.append(' ');
    return this.visit(thing, collector);
  }

  injectJoin(list, collector, joinStr) {
    const len = list.length - 1;
    return list.map((x, i) => [x, i]).reduce((c, [x, i]) => {
      if (i === len) {
        return this.visit(x, c);
      } else {
        return this.visit(x, c).append(joinStr);
      }
    }, collector);
  }

  infixValue(o, collector, value) {
    collector = this.visit(o.left, collector);
    collector.append(value);
    return this.visit(o.right, collector);
  }

  aggregate(name, o, collector) {
    collector.append(`${name}(`);
    if (o.distinct) {
      collector.append('DISTINCT ');
    }

    collector = this.injectJoin(o.expressions, collector, ', ').append(')');

    if (o.alias) {
      collector.append(' AS ');
      return this.visit(o.alias, collector);
    }

    return collector;
  }
}
