// @flow
export default class PlainString {
  str: string;
  constructor() {
    this.str = '';
  }

  get value() {
    return this.str;
  }

  append(str: string) {
    this.str += str;
    return this;
  }
}
