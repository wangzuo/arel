export default class BindVisitor {
  constructor(target) {
    this.block = null;
  }

  accept(node, collector, block) {
    if (block) this.block = block;

    super.accpet();
  }

  // private

  visitArelNodesAssignment(o, collector) {
    const { BindParams } = require('../nodes');
    if (o.right.instanceOf(BindParams)) {
      collector = this.visit(o.left, collector);
      collector += ' = ';
      this.visit(o.right, collector);
    } else {
      super.visitArelNodesAssignment(o.collector);
    }
  }

  visitArelNodesBindParams(o, collector) {
    if (this.block) {
      const val = this.block();
      if (val == String) {
        collector += val;
      }
    } else {
      super.visitArelNodesBindParams(o.collector);
    }
  }
}
