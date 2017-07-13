import ToSql from './ToSql';

export default class MySQL extends ToSql {
  // private

  visitUnion(o, collector, suppressParens = false) {
    const { Union } = require('../nodes');

    if (!suppressParens) {
      collector.append('( ');
    }

    collector =
      o.left instanceof Union
        ? this.visitUnion(o.left, collector, true)
        : this.visit(o.left, collector);

    collector.append(' UNION ');
    collector =
      o.right instanceof Union
        ? this.visitUnion(o.right, collector, true)
        : this.visit(o.right, collector);

    return suppressParens ? collector : collector.append(' )');
  }

  visitBin(o, collector) {
    collector.append('BINARY ');
    return this.visit(o.expr, collector);
  }

  // TODO
  // visitSelectStatement(o, collector) {
  //   const { Limit } = require('../nodes');
  //   if (o.offset && !o.limit) {
  //     o.limit = new Limit(18446744073709551615);
  //   }
  //   return super.visitSelectStatement(o, collector);
  // }

  visitSelectCore(o, collector) {
    const { sql } = require('../Arel');
    o.froms = o.froms || sql('DUAL');
    return super.visitSelectCore(o, collector);
  }

  visitUpdateStatement(o, collector) {
    collector.append('UPDATE ');
    collector = this.visit(o.relation, collector);

    return this.maybeVisit(o.limit, collector);
  }

  visitConcat(o, collector) {
    collector.append(' CONCAT(');
    this.visit(o.left, collector);
    collector.append(', ');
    this.visit(o.right, collector);
    collector.append(') ');
    return collector;
  }
}
