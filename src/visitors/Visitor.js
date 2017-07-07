export default class Visitor {
  // constructor() {
  //   this.dispatch = this.getDispatchCache();
  // }

  accept(object) {
    return this.visit(object);
  }

  // private

  // static get dispatchCache() {
  //   return {};
  // }

  // getDispatchCache() {
  //   return this.constructor.dispatchCache;
  // }

  visit(object) {
    const method = `visit${object.constructor.name}`;
    if (!this[method]) throw new Error(method + ' missing');
    return this[method](object);
  }
}
