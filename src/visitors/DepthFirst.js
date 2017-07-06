import Visitor from './Visitor';

export default class DepthFirst extends Visitor {
  constructor(block = null) {
    this.block = block || (() => {});
    super();
  }

  // private

  visit(o) {
    super.visit();
    this.block(o);
  }

  unary(o) {}

  function(o) {}
}
