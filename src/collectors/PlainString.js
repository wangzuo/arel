export default class PlainString {
  constructor() {
    this.str = '';
  }

  get value() {
    return this.str;
  }

  append(str) {
    this.str += str;
    return this;
  }
}
