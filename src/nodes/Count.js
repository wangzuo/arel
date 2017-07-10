import Function from './Function';

export default class Count extends Function {
  constructor(expr, distinct = false, aliaz = null) {
    super(expr, aliaz);
    this.distinct = distinct;
  }
}
