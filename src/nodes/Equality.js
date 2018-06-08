// @flow
import Binary from './Binary';

export default class Equality extends Binary {
  get operand1() {
    return this.left;
  }

  get operand2() {
    return this.right;
  }
}
