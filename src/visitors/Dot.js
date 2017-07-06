import Visitor from './Visitor';

class Node {
  constructor(name, id, fields = []) {
    this.name = name;
    this.id = id;
    this.fields = fields;
  }
}

class Edge {
  constructor(name, from, to) {
    this.name = name;
    this.from = from;
    this.to = to;
  }
}

export default class Dot extends Visitor {
  constructor() {
    super();
    this.nodes = [];
    this.edgets = [];
    this.nodeStack = [];
    this.edgeStack = [];
    this.seen = {};
  }

  accpet(object, collector) {
    this.visit(object);
    collector.push(this.toDot());
  }

  // private

  visit_Arel_Nodes_Ordering(o) {}
  visit_Arel_Nodes_TableAlias(o) {}
  visit_Arel_Nodes_Count(o) {}
  visit_Arel_Nodes_Values(o) {}
  visit_Arel_Nodes_StringJoin(o) {}
  visit_Arel_Nodes_InnerJoin(o) {}
}
