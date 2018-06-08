// @flow
import hash from '../hash';
import Node from './Node';
import JoinSource from './JoinSource';

export default class SelectCore extends Node {
  constructor() {
    super();
    this.source = new JoinSource(null);
    this.top = null;
    this.setQuantifier = null;
    this.projections = [];
    this.wheres = [];
    this.groups = [];
    this.havings = [];
    this.windows = [];
  }

  get from() {
    return this.source.left;
  }

  set from(value) {
    this.source.left = value;
  }

  get froms() {
    return this.from;
  }

  set froms(value) {
    this.from = value;
  }

  get hash() {
    return hash([
      this.source,
      this.top,
      this.setQuantifier,
      this.projections,
      this.wheres,
      this.groups,
      this.havings,
      this.windows
    ]);
  }

  eql() {}
}
