import Unary from './Unary';

export default class Extract extends Unary {
  constructor(expr, field) {
    super(expr);
    this.field = field;
  }
}
