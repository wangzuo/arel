import BindParam from '../nodes/BindParam';

export default class Bind {
  constructor() {
    this.parts = [];
  }

  append(str) {
    this.parts.push(str);
    return this;
  }

  addBind(bind) {
    this.parts.push(bind);
    return this;
  }

  get value() {
    return this.parts;
  }

  substituteBinds(bvs) {
    this.parts = this.parts.map(val => {
      if (val instanceof BindParam) {
        return bvs.shift();
      } else {
        return val;
      }
    });

    return this.parts;
  }

  compile(bvs) {
    return this.substituteBinds(bvs).join('');
  }
}
