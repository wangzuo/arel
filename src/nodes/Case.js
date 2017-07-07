import last from 'lodash/last';
import Node from './Node';
import Binary from './Binary';
import Unary from './Unary';

class When extends Binary {}
class Else extends Unary {}

export default class Case extends Node {
  constructor(expression = null, _default = null) {
    this.case = expression;
    this.conditions = [];
    this.default = _default;
  }

  when(condition, expression = null) {
    this.conditions.push(new When(Nodes.buildQuoted(condition), expression));
    return this;
  }

  then(expression) {
    last(this.conditions).right = Nodes.buildQuoted(expression);
    return this;
  }

  else(expression) {
    this.default = new Else(Nodes.buildQuoted(expression));
    return this;
  }

  hash() {
    return [this.case, this.conditions, this.default].hash;
  }

  eql() {}
}
