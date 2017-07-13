import ToSql from './ToSql';

export default class SQLite extends ToSql {
  // private

  visitLock(o, collector) {
    return collector;
  }

  visitSelectStatement(o, collector) {
    if (o.offset && !o.limit) {
      const { Limit } = require('../nodes');
      o.limit = new Limit(-1);
    }
    return super.visitSelectStatement(o, collector);
  }

  visitTrue(o, collector) {
    return collector.append('1');
  }

  visitFalse(o, collector) {
    return collector.append('0');
  }
}
