import ToSql from './ToSql';

export default class WhereSql extends ToSql {
  constructor(innerVisitor, ...args) {
    this.innerVisitor = innerVisitor;
    super();
  }

  // private

  visit_Arel_Nodes_SelectCore(o, collector) {}
}
