import PlainString from './PlainString';

export default class SQLString extends PlainString {
  constructor() {
    super();
    this.bindIndex = 1;
  }

  addBind(bind, fn) {
    this.append(fn(this.bindIndex));
    this.bindIndex += 1;
    return this;
  }

  compile(bvs) {
    return this.value;
  }
}
