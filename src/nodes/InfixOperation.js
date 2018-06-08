// @flow
import extend from 'lodash/extend';
import Binary from './Binary';

export default class InfixOperation extends Binary {
  constructor(operator, left, right) {
    super(left, right);

    this.operator = operator;

    const { default: Expressions } = require('../Expressions');
    const { default: Predications } = require('../Predications');
    const { default: AliasPredication } = require('../AliasPredication');
    const { default: OrderPredications } = require('../OrderPredications');
    const { default: Math } = require('../Math');

    extend(this, Expressions);
    extend(this, Predications);
    extend(this, AliasPredication);
    extend(this, OrderPredications);
    extend(this, Math);
  }
}

export class Multiplication extends InfixOperation {
  constructor(left, right) {
    super('*', left, right);
  }
}

export class Division extends InfixOperation {
  constructor(left, right) {
    super('/', left, right);
  }
}

export class Addition extends InfixOperation {
  constructor(left, right) {
    super('+', left, right);
  }
}

export class Subtraction extends InfixOperation {
  constructor(left, right) {
    super('-', left, right);
  }
}

export class Concat extends InfixOperation {
  constructor(left, right) {
    super('||', left, right);
  }
}

export class BitwiseAnd extends InfixOperation {
  constructor(left, right) {
    super('&', left, right);
  }
}

export class BitwiseOr extends InfixOperation {
  constructor(left, right) {
    super('|', left, right);
  }
}

export class BitwiseXor extends InfixOperation {
  constructor(left, right) {
    super('^', left, right);
  }
}

export class BitwiseShiftLeft extends InfixOperation {
  constructor(left, right) {
    super('<<', left, right);
  }
}

export class BitwiseShiftRight extends InfixOperation {
  constructor(left, right) {
    super('>>', left, right);
  }
}
