import SqlLiteral from './nodes/SqlLiteral';
import Node from './nodes/Node';
import Table from './Table';

const Arel = {
  VERSION: '8.0.0',
  sql(rawSql) {
    return new SqlLiteral(rawSql);
  },

  Node
};

Arel.star = Arel.sql('*');

export { Table };
export default Arel;
