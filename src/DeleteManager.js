// @flow
import TreeManager from './TreeManager';

export default class DeleteManager extends TreeManager {
  constructor() {
    super();

    const { DeleteStatement } = require('./nodes');
    this.ast = new DeleteStatement();
    this.ctx = this.ast;
  }

  from(relation) {
    this.ast.relation = relation;
    return this;
  }

  take(limit: number) {
    if (limit) {
      const { Limit, buildQuoted } = require('./nodes');
      this.ast.limit = new Limit(buildQuoted(limit));
    }
  }

  set wheres(list) {
    this.ast.wheres = list;
  }
}
