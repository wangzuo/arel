export default class Visitor {
  accept(object) {
    return this.visit(object);
  }

  // private

  visit(object) {
    const method = `visit${object.constructor.name}`;
    if (!this[method]) throw new Error(`${method} missing`);
    return this[method](object);
  }
}
