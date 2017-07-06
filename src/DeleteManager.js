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

  take(limit) {
    if (limit) {
      const { Limit, default: Nodes } = require('./nodes');
      this.ast.limit = new Limit(Nodes.buildQuoted(limit));
    }
  }

  set wheres(list) {
    this.ast.wheres = list;
  }
}
