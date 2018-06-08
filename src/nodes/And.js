// @flow
import Node from './Node';

export default class And extends Node {
  constructor(children) {
    super();
    this.children = children;
  }

  get left() {
    return this.children[0];
  }

  get right() {
    return this.children[1];
  }

  get hash() {
    return this.children.hash;
  }

  eql(other) {
    return (
      this.constructor == other.constructor && this.children == other.children
    );
  }
}
