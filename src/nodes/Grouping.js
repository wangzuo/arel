import extend from 'lodash/extend';
import Unary from './Unary';

export default class Grouping extends Unary {
  constructor(expr) {
    super(expr);

    const { default: Predications } = require('../Predications');
    extend(this, Predications);
  }
}
