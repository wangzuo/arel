import Node from './Node';

export default class InsertStatement extends Node {
  constructor() {
    super();
    this.relation = null;
    this.columns = [];
    this.values = null;
    this.select = null;
  }
}
