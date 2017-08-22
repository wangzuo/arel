// TODO
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
    this.edges = [];
    this.nodeStack = [];
    this.edgeStack = [];
    this.seen = {};

    // alias

    this.visitFullOuterJoin = this.visitInnerJoin;
    this.visitOuterJoin = this.visitInnerJoin;
    this.visitRightOuterJoin = this.visitRightOuterJoin;

    this.visitGroup = this.unary;
    this.visitCube = this.unary;
    this.visitRollUp = this.unary;
    this.visitGroupingSet = this.unary;
    this.visitGroupingElement = this.unary;
    this.visitGrouping = this.unary;
    this.visitHaving = this.unary;
    this.visitLimit = this.unary;
    this.visitNot = this.unary;
    this.visitOffset = this.unary;
    this.visitOn = this.unary;
    this.visitTop = this.unary;
    this.visitUnqualifiedColumn = this.unary;
    this.visitPreceding = this.unary;
    this.visitFollowing = this.unary;
    this.visitRows = this.unary;
    this.visitRange = this.unary;

    this.visitExists = this.func;
    this.visitMin = this.func;
    this.visitMax = this.func;
    this.visitAvg = this.func;
    this.visitSum = this.func;

    this.visitAs = this.binary;
    this.visitAssignment = this.binary;
    this.visitBetween = this.binary;
    this.visitConcat = this.binary;
    this.visitDoesNotMatch = this.binary;
    this.visitEquality = this.binary;
    this.visitGreaterThan = this.binary;
    this.visitGreaterThanOrEqual = this.binary;
    this.visitIn = this.binary;
    this.visitJoinSource = this.binary;
    this.visitLessThan = this.binary;
    this.visitLessThanOrEqual = this.binary;
    this.visitMatches = this.binary;
    this.visitNotEqual = this.binary;
    this.visitNotIn = this.binary;
    this.visitOr = this.binary;
    this.visitOver = this.binary;

    this.visitTime = this.visitString;
    this.visitDate = this.visitString;
    this.visitDateTime = this.visitString;
    this.visitNilClass = this.visitString;
    this.visitTrueClass = this.visitString;
    this.visitFalseClass = this.visitString;
    this.visitInteger = this.visitString;
    this.visitFixnum = this.visitString;
    this.visitBigDecimal = this.visitString;
    this.visitFloat = this.visitString;
    this.visitSymbol = this.visitString;
    this.visitArel_Nodes_SqlLiteral = this.visitString;
  }

  accpet(object, collector) {
    this.visit(object);
    return collector.push(this.toDot());
  }

  // private

  visitOrdering(o) {
    this.visitEdge(o, 'expr');
  }

  visitTableAlias(o) {
    this.visitEdge(o, 'name');
    this.visitEdge(o, 'relation');
  }

  visitCount(o) {
    this.visitEdge(o, 'expressions');
    this.visitEdge(o, 'distinct');
  }

  visitValues(o) {
    this.visitEdge(o, 'expressions');
  }

  visitStringJoin(o) {
    this.visitEdge(o, 'left');
  }

  visitInnerJoin(o) {
    this.visitEdge(o, 'left');
    this.visitEdge(o, 'right');
  }

  visitDeleteStatement(o) {
    this.visitEdge(o, 'relation');
    this.visitEdge(o, 'wheres');
  }

  unary(o) {
    this.visitEdge(o, 'expr');
  }

  window(o) {
    this.visitEdge(o, 'partitions');
    this.visitEdge(o, 'orders');
    this.visitEdge(o, 'framing');
  }

  namedWindow(o) {
    this.visitEdge(o, 'partitions');
    this.visitEdge(o, 'orders');
    this.visitEdge(o, 'framing');
    this.visitEdge(o, 'name');
  }

  func(o) {}

  visitSet() {}

  visitEdge() {}

  visit(o) {}

  edge() {}

  extract(o) {}

  withNode(node) {}

  quote(string) {
    return string.replace('"', '\\"');
  }

  toDot() {
    return `digraph "Arel" {\nnode [width=0.375,height=0.25,shape=record];\n${this.nodes
      .map(node => {
        let label = `"<f0>${node.name}"`;
        node.fields.forEach((field, i) => {
          label += `|<f${i + 1}>${this.quote(field)}`;
        });
        return `${node.id} [label="${label}"];`;
      })
      .join('\n')}\n${this.edges
      .map(edge => `${edge.from.id} -> ${edge.to.id} [label="${edge.name}"];`)
      .join('\n')}\n`;
  }
}
