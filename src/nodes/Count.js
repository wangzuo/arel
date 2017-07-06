import Node from './Node';

export default class Count extends Node {
  constructor(expr, distinct = false, aliaz = null) {
    super(expr, aliaz);
    this.distinct = distinct;
  }
}
