import ToSql from './ToSql';

const CUBE = 'CUBE';
const ROLLUP = 'ROLLUP';
const GROUPING_SET = 'GROUPING SET';

export default class PostgreSQL extends ToSql {
  // private

  visitMatches(o, collector) {
    const op = o.isCaseSensitive() ? ' LIKE ' : ' ILIKE ';
    // collector = this.infixValue()
  }
}
