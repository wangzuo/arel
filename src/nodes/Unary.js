// @flow
import Node from './Node';

export default class Unary extends Node {
  constructor(expr) {
    super();
    this.expr = expr;
  }

  // alias
  get value() {
    return this.expr;
  }

  get hash() {
    return this.expr.hash;
  }

  eql(other) {}
}
