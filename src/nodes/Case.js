// @flow
import last from 'lodash/last';
import Node from './Node';
import Binary from './Binary';
import Unary from './Unary';

class When extends Binary {}
class Else extends Unary {}

export default class Case extends Node {
  constructor(expression = null, _default = null) {
    super();
    this.case = expression;
    this.conditions = [];
    this.default = _default;
  }

  when(condition, expression = null) {
    const { buildQuoted } = require('../nodes');
    this.conditions.push(new When(buildQuoted(condition), expression));
    return this;
  }

  then(expression) {
    const { buildQuoted } = require('../nodes');
    last(this.conditions).right = buildQuoted(expression);
    return this;
  }

  else(expression) {
    const { buildQuoted } = require('../nodes');
    this.default = new Else(buildQuoted(expression));
    return this;
  }

  // hash() {
  //   return [this.case, this.conditions, this.default].hash;
  // }

  // eql() {}
}
