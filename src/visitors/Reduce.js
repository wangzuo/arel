import Visitor from './Visitor';

export default class Reduce extends Visitor {
  accept(object, collector) {
    return this.visit(object, collector);
  }

  // private

  visit(object, collector) {
    const method = `visit${object.constructor.name}`;

    if (!this[method]) throw new Error(method + ' missing');
    return this[method](object, collector);
  }
}
