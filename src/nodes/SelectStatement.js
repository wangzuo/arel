import Node from './Node';
import SelectCore from './SelectCore';

export default class SelectStatement extends Node {
  constructor(cores) {
    super();
    this.cores = cores || [new SelectCore()];
    this.orders = [];
    this.limit = null;
    this.lock = null;
    this.offset = null;
    this.with = null;
  }

  hash() {}

  eql() {}
}
