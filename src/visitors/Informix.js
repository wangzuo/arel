import ToSql from './ToSql';

class Informix extends ToSql {
  // private

  visit_Arel_Nodes_SelectStatement(o, collector) {}
  visit_Arel_Nodes_SelectCore(o, collector) {}
  visit_Arel_Nodes_Offset(o, collector) {}
  visit_Arel_Nodes_Limit(o, collector) {}
}
