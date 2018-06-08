// @flow
import PlainString from './PlainString';

export default class SQLString extends PlainString {
  bindIndex: number;

  constructor() {
    super();
    this.bindIndex = 1;
  }

  addBind(bind, fn) {
    this.append(fn(this.bindIndex));
    this.bindIndex += 1;
    return this;
  }

  compile() {
    return this.value;
  }
}
