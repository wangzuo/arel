import TreeManager from './TreeManager';

export default class UpdateManager extends TreeManager {
  constructor() {
    super();

    const { UpdateStatement } = require('./nodes');

    this.ast = new UpdateStatement();
    this.ctx = this.ast;
  }

  take(limit) {
    if (limit) {
      const { Limit, buildQuoted } = require('./nodes');
      this.ast.limit = new Limit(buildQuoted(limit));
    }

    return this;
  }

  set key(key) {
    const { buildQuoted } = require('./nodes');
    this.ast.key = buildQuoted(key);
  }

  get key() {
    return this.ast.key;
  }

  order(...expr) {
    this.ast.orders = expr;
    return this;
  }

  table(table) {
    this.ast.relation = table;
    return this;
  }

  set wheres(exprs) {
    this.ast.wheres = exprs;
  }

  where(expr) {
    this.ast.wheres.push(expr);
    return this;
  }

  set(values) {
    const { SqlLiteral } = require('./nodes');
    if (values instanceof SqlLiteral) {
      this.ast.values = [values];
    } else {
      const { Assignment, UnqualifiedColumn } = require('./nodes');
      this.ast.values = Array.from(values).map(
        ([column, value]) =>
          new Assignment(new UnqualifiedColumn(column), value)
      );
    }
    return this;
  }
}
