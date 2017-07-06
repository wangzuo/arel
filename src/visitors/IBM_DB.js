import ToSql from './ToSql';

class IBM_DB extends ToSql {
  // private

  visit_Arel_Nodes_Limit(o, collector) {
    // collector << "FETCH FIRST "
    // collector = visit o.expr, collector
    // collector << " ROWS ONLY"
  }
}
