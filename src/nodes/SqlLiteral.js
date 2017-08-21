import extend from 'lodash/extend';

export default class SqlLiteral {
  constructor(value) {
    this.value = value;

    const { default: Expressions } = require('../Expressions');
    const { default: Predications } = require('../Predications');
    const { default: AliasPredication } = require('../AliasPredication');
    const { default: OrderPredications } = require('../OrderPredications');

    extend(this, Expressions);
    extend(this, Predications);
    extend(this, AliasPredication);
    extend(this, OrderPredications);
  }

  // TODO
  // encodeWith(coder) {}

  toString() {
    return this.value;
  }
}
