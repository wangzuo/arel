// @flow
import Node from './Node';

export default class ValuesList extends Node {
  constructor(rows) {
    super();
    this.rows = rows;
  }
}
