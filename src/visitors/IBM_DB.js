import ToSql from './ToSql';

export default class IBM_DB extends ToSql {
  // private

  visitLimit(o, collector) {
    collector.append('FETCH FIRST ');
    collector = this.visit(o.expr, collector);
    return collector.append(' ROWS ONLY');
  }
}
