// @flow
import BindParam from '../nodes/BindParam';

export default class Bind {
  parts: Array<string>;

  constructor() {
    this.parts = [];
  }

  append(str: string) {
    this.parts.push(str);
    return this;
  }

  addBind(bind: string) {
    this.parts.push(bind);
    return this;
  }

  get value() {
    return this.parts;
  }

  substituteBinds(bvs) {
    this.parts = this.parts.map(
      val => (val instanceof BindParam ? bvs.shift() : val)
    );

    return this.parts;
  }

  compile(bvs) {
    return this.substituteBinds(bvs).join('');
  }
}
