// import hash from 'object-hash';
import Node from './Node';

export default class UpdateStatement extends Node {
  constructor() {
    super();
    this.relation = null;
    this.wheres = [];
    this.values = [];
    this.orders = [];
    this.limit = null;
    this.key = null;
  }

  get hash() {
    hash([
      this.relation,
      this.wheres,
      this.values,
      this.orders,
      this.limit,
      this.key
    ]);
  }

  eql() {}
}
