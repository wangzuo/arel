import Node from './Node';

export default class Unary extends Node {
  constructor(expr) {
    super();
    this.expr = expr;
  }

  get hash() {
    return this.expr.hash;
  }

  eql(other) {}
}
