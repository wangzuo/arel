import _ from 'lodash';
import Node from './Node';
import SqlLiteral from './SqlLiteral';

class Function extends Node {
  constructor(expr, aliaz = null) {
    super();

    const Predications = require('../Predications').default;
    const WindowPredications = require('../WindowPredications').default;
    const OrderPredications = require('../OrderPredications').default;

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
export default Function;
