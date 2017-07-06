import ToSql from './ToSql';

export default class Oracle extends ToSql {
  // private

  visit_Arel_Nodes_SelectStatement(o, collector) {}
  visit_Arel_Nodes_Limit(o, collector) {}
  visit_Arel_Nodes_Offset(o, collector) {}
  visit_Arel_Nodes_Except(o, collector) {}
  visit_Arel_Nodes_UpdateStatement(o, collector) {}
  order_hacks(o) {}
  split_order_string(string) {}
  visit_Arel_Nodes_BindParam(o, collector) {}
}
