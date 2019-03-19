import ToSql from './ToSql';

class Informix extends ToSql {
  // private

  visitSelectStatement(o, collector) {}
  visitSelectCore(o, collector) {}
  visitOffset(o, collector) {}
  visitLimit(o, collector) {}
}

export default Informix;
