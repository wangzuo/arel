import ToSql from './ToSql';

export default class MySQL extends ToSql {
  // private

  visitArelNodesUnion(o, collector, suppressParens = false) {}
  visitArelNodesBin(o, collector) {}
  visitArelNodesSelectStatement(o, collector) {}
  visitArelNodesUpdateStatement(o, collector) {}
  visitArelNodesConcat(o, collector) {}
}
