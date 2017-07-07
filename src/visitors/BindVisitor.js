import _ from 'lodash';

export default superclass =>
  class BindVisitor extends superclass {
    constructor(target) {
      super(target);
      this.block = null;
    }

    accept(node, collector, block) {
      if (block) this.block = block;

      return super.accept(node, collector);
    }

    // private

    visitAssignment(o, collector) {
      const { BindParam } = require('../nodes');

      if (o.right instanceof BindParam) {
        collector = this.visit(o.left, collector);
        collector.append(' = ');
        return this.visit(o.right, collector);
      } else {
        return super.visitAssignment(o, collector);
      }
    }

    visitBindParam(o, collector) {
      if (this.block) {
        const val = this.block();

        if (_.isString(val)) {
          return collector.append(val);
        }
      } else {
        return super.visitBindParam(o, collector);
      }
    }
  };
