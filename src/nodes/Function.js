import extend from 'lodash/extend';
import Node from './Node';
import SqlLiteral from './SqlLiteral';

export default class Function extends Node {
  constructor(expr, aliaz = null) {
    super();

    const { default: Predications } = require('../Predications');
    const { default: WindowPredications } = require('../WindowPredications');
    const { default: OrderPredications } = require('../OrderPredications');

    extend(this, Predications);
    extend(this, WindowPredications);
    extend(this, OrderPredications);

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
