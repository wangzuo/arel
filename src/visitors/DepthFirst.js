import Visitor from './Visitor';

export default class DepthFirst extends Visitor {
  constructor(block = null) {
    super();
    this.block = block || (() => {});
  }

  // private

  visit(o) {
    super.visit();
    this.block(o);
  }

  unary(o) {}

  function(o) {}
}
