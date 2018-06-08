// @flow
import isNull from 'lodash/isNull';
import Node from './Node';
import Unary from './Unary';

export class Quoted extends Unary {
  constructor(expr) {
    super(expr);
  }

  get val() {
    return this.value;
  }

  isNull() {
    return isNull(this.val);
  }
}

export default class Casted extends Node {
  constructor(val, attribute) {
    super();
    this.val = val;
    this.attribute = attribute;
  }

  isNull() {
    return isNull(this.val);
  }

  hash() {}

  eql() {}
}
