import _ from 'lodash';
import Node from './Node';
import SqlLiteral from './SqlLiteral';

export default class Function extends Node {
  constructor(expr, aliaz = null) {
    super();

    const { default: Predications } = require('../Predications');
    const { default: WindowPredications } = require('../WindowPredications');
    const { default: OrderPredications } = require('../OrderPredications');

    _.extend(this, Predications);
    _.extend(this, WindowPredications);
    _.extend(this, OrderPredications);

    this.expressions = expr;
    this.alias = aliaz && new SqlLiteral(aliaz);
    this.distinct = false;
  }

  as(aliaz) {
    this.alias = new SqlLiteral(aliaz);
    return this;
  }

  hash() {}

  eql(other) {}
}

export class Sum extends Function {}
export class Exists extends Function {}
export class Max extends Function {}
export class Min extends Function {}
export class Avg extends Function {}
