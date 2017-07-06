import Function from './Function';

export default class NamedFunction extends Function {
  constructor(name, expr, aliaz = null) {
    super(expr, aliaz);
    this.name = name;
  }

  hash() {}

  eql() {}
}
