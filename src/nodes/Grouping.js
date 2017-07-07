import extend from 'lodash/extend';
import Predications from '../Predications';
import Unary from './Unary';

export default class Grouping extends Unary {
  constructor(expr) {
    super(expr);
    extend(this, Predications);
  }
}
