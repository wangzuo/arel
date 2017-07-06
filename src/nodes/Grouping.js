import _ from 'lodash';
import Predications from '../Predications';
import Unary from './Unary';

export default class Grouping extends Unary {
  constructor(expr) {
    super(expr);
    _.extend(this, Predications);
  }
}
