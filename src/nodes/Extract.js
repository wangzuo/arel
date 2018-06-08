// @flow
import extend from 'lodash/extend';
import Unary from './Unary';

export default class Extract extends Unary {
  constructor(expr, field) {
    super(expr);
    this.field = field;

    const { default: Predications } = require('../Predications');
    const { default: AliasPredication } = require('../AliasPredication');

    extend(this, Predications);
    extend(this, AliasPredication);
  }

  get hash() {}

  eql() {}
}
