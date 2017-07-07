import { Node, SqlLiteral } from './nodes';
import Table from './Table';

const Arel = {
  VERSION: '8.0.0',
  sql(rawSql) {
    return new SqlLiteral(rawSql);
  },

  star() {
    return Arel.sql('*');
  },

  Node
};

export { Table };
export default Arel;
