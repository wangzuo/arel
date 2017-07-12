import ToSql from './ToSql';

export default class WhereSql extends ToSql {
  constructor(innerVisitor, ...args) {
    super(...args);
    this.innerVisitor = innerVisitor;
  }

  // private

  visitSelectCore(o, collector) {
    const { SqlLiteral } = require('../nodes');
    collector.append('WHERE ');
    const wheres = o.wheres.map(
      where =>
        new SqlLiteral(
          this.innerVisitor.accept(where, new collector.constructor()).value
        )
    );
    return this.injectJoin(wheres, collector, ' AND ');
  }
}
