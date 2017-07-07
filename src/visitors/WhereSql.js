import ToSql from './ToSql';

export default class WhereSql extends ToSql {
  constructor(innerVisitor, ...args) {
    super();
    this.innerVisitor = innerVisitor;
  }

  // private

  visitSelectCore(o, collector) {}
}
