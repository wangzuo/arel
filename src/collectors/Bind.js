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

  value() {
    return this.parts;
  }

  substituteBinds(bvs) {
    // const bvs = bvs.dup();
    this.parts.map(val => {
      if (val == BindParam) {
        return bvs.shift;
      } else {
        return val;
      }
    });
    return this.parts;
  }

  compile(bvs) {
    this.substituteBinds(bvs).join();
  }
}
