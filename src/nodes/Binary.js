// @flow
import hash from '../hash';
import Node from './Node';

export default class Binary extends Node {
  constructor(left, right) {
    super();
    this.left = left;
    this.right = right;
  }

  get hash() {
    return hash([this.constructor.name, this.left, this.right]);
  }

  eql() {}
}
