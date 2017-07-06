import _ from 'lodash';

export default class SqlLiteral {
  constructor(value) {
    this.value = value;

    const { default: Expressions } = require('../Expressions');
    const { default: Predications } = require('../Predications');
    const { default: AliasPredication } = require('../AliasPredication');
    const { default: OrderPredications } = require('../OrderPredications');

    _.extend(this, Expressions);
    _.extend(this, Predications);
    _.extend(this, AliasPredication);
    _.extend(this, OrderPredications);
  }

  encodeWith(coder) {}

  toString() {
    return this.value;
  }
}
