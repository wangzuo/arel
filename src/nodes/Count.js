import Func from './Func';

export default class Count extends Func {
  constructor(expr, distinct = false, aliaz = null) {
    super(expr, aliaz);
    this.distinct = distinct;
  }
}
