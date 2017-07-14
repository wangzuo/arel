import ToSql from './ToSql';

export default class Oracle12 extends ToSql {
  // private

  visitSelectStatement(o, collector) {
    if (o.limit && o.lock) {
      throw new Error(
        'Combination of limit and lock is not supported, because generated SQL statements `SELECT FOR UPDATE and FETCH FIRST n ROWS` generates ORA-02014.`'
      );
    }

    return super.visitSelectStatement(o, collector);
  }

  visitSelectOptions(o, collector) {
    collector = this.maybeVisit(o.offset, collector);
    collector = this.maybeVisit(o.limit, collector);
    collector = this.maybeVisit(o.lock, collector);
    return collector;
  }

  visitLimit(o, collector) {
    collector.append('FETCH FIRST ');
    collector = this.visit(o.expr, collector);
    return collector.append(' ROWS ONLY');
  }

  visitOffset(o, collector) {
    collector.append('OFFSET ');
    this.visit(o.expr, collector);
    return collector.append(' ROWS');
  }

  visitExcept(o, collector) {
    collector.append('( ');
    collector = this.infixValue(o, collector, ' MINUS ');
    return collector.append(' )');
  }

  visitUpdateStatement(o, collector) {
    // Oracle does not allow ORDER BY/LIMIT in UPDATEs.
    if (!isEmpty(o.orders) && isEmpty(o.limit)) {
      // However, there is no harm in silently eating the ORDER BY clause if no LIMIT has been provideds
      // otherwise let the user deal with the error
      // o = o.dup();
      o.orders = [];
    }

    return super.visitUpdateStatement(o, collector);
  }

  visitBindParam(o, collector) {
    return collector.addBind(o, i => `:a${i}`);
  }
}
