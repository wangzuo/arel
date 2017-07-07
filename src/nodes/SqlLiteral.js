import extend from 'lodash/extend';
import Expressions from '../Expressions';
import Predications from '../Predications';
import AliasPredication from '../AliasPredication';
import OrderPredications from '../OrderPredications';

export default class SqlLiteral {
  constructor(value) {
    this.value = value;

    extend(this, Expressions);
    extend(this, Predications);
    extend(this, AliasPredication);
    extend(this, OrderPredications);
  }

  encodeWith(coder) {}

  toString() {
    return this.value;
  }
}
