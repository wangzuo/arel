import Unary from './Unary';

export default class UnqualifiedColumn extends Unary {
  get attribute() {
    return this.expr;
  }

  set attribute(value) {
    this.expr = value;
  }

  get relation() {
    return this.expr.relation;
  }

  get column() {
    return this.expr.column;
  }

  get name() {
    return this.expr.name;
  }
}
