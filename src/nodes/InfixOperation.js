import _ from 'lodash';
import Node from './Node';

class InfixOperation extends Node {
  constructor(operator, left, right) {
    super(left, right);

    this.operator = operator;

    const { default: Expressions } = require('../Expressions');
    const { default: Predications } = require('../Predications');
    const { default: AliasPredication } = require('../AliasPredication');
    const { default: OrderPredications } = require('../OrderPredications');
    const { default: Math } = require('../Math');

    _.extend(this, Expressions);
    _.extend(this, Predications);
    _.extend(this, AliasPredication);
    _.extend(this, OrderPredications);
    _.extend(this, Math);
  }
}

export class Multiplication extends InfixOperation {}
export class Division extends InfixOperation {}
export class Addition extends InfixOperation {}
export class Subtraction extends InfixOperation {}
export class Concat extends InfixOperation {}
export class BitwiseAnd extends InfixOperation {}
export class BitwiseOr extends InfixOperation {}
export class BitwiseXor extends InfixOperation {}
export class BitwiseShiftLeft extends InfixOperation {}
export class BitwiseShiftRight extends InfixOperation {}
export default InfixOperation;
