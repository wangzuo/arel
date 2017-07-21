import Func from './Func';

export default class NamedFunc extends Func {
  constructor(name, expr, aliaz = null) {
    super(expr, aliaz);
    this.name = name;
  }

  hash() {}

  eql() {}
}
