import * as Arel from '../../Arel';
import MSSQL from '../MSSQL';

const _visitor = new MSSQL(Arel.Table.engine.connection);
const _table = new Arel.Table('users');

function compile(node) {
  return _visitor
    .accept(node, new Arel.collectors.SQLString())
    .value.replace(/\s\s+/g, ' ')
    .trim();
}

describe('MSSQL', () => {
  it('should not modify query if no offset or limit', () => {
    const stmt = new Arel.nodes.SelectStatement();
    expect(compile(stmt)).toBe('SELECT');
  });

  it('should go over table PK if no .order() or .group()', () => {
    const stmt = new Arel.nodes.SelectStatement();
    stmt.cores[0].from = _table;
    stmt.limit = new Arel.nodes.Limit(10);
    expect(compile(stmt)).toBe(
      `SELECT _t.* FROM (SELECT ROW_NUMBER() OVER (ORDER BY \"users\".\"id\") as _row_num FROM \"users\") as _t WHERE _row_num BETWEEN 1 AND 10`
    );
  });

  it('caches the PK lookup for order', () => {
    const connection = { primaryKeys: [['id'], ['users']] };
    const visitor = new MSSQL(connection);
    const stmt = new Arel.nodes.SelectStatement();
  });

  it('should use TOP for limited deletes', () => {
    const stmt = new Arel.nodes.DeleteStatement();
    stmt.relation = _table;
    stmt.limit = new Arel.nodes.Limit(10);
    expect(compile(stmt)).toBe(`DELETE TOP (10) FROM "users"`);
  });

  it('should go over query ORDER BY if .order()', () => {
    const stmt = new Arel.nodes.SelectStatement();
    stmt.limit = new Arel.nodes.Limit(10);
    stmt.orders.push(Arel.sql('order_by'));
    expect(compile(stmt)).toBe(
      `SELECT _t.* FROM (SELECT ROW_NUMBER() OVER (ORDER BY order_by) as _row_num) as _t WHERE _row_num BETWEEN 1 AND 10`
    );
  });

  it('should go over query GROUP BY if no .order() and there is .group()', () => {
    const stmt = new Arel.nodes.SelectStatement();
    stmt.cores[0].groups.push(Arel.sql('group_by'));
    stmt.limit = new Arel.nodes.Limit(10);
    expect(compile(stmt)).toBe(
      `SELECT _t.* FROM (SELECT ROW_NUMBER() OVER (ORDER BY group_by) as _row_num GROUP BY group_by) as _t WHERE _row_num BETWEEN 1 AND 10`
    );
  });

  it('should use BETWEEN if both .limit() and .offset', () => {
    const stmt = new Arel.nodes.SelectStatement();
    stmt.limit = new Arel.nodes.Limit(10);
    stmt.offset = new Arel.nodes.Offset(20);
    expect(compile(stmt)).toBe(
      `SELECT _t.* FROM (SELECT ROW_NUMBER() OVER (ORDER BY ) as _row_num) as _t WHERE _row_num BETWEEN 21 AND 30`
    );
  });

  it('should use >= if only .offset', () => {
    const stmt = new Arel.nodes.SelectStatement();
    stmt.offset = new Arel.nodes.Offset(20);
    expect(compile(stmt)).toBe(
      `SELECT _t.* FROM (SELECT ROW_NUMBER() OVER (ORDER BY ) as _row_num) as _t WHERE _row_num >= 21`
    );
  });

  it('should generate subquery for .count', () => {
    const stmt = new Arel.nodes.SelectStatement();
    stmt.limit = new Arel.nodes.Limit(10);
    stmt.cores[0].projections.push(new Arel.nodes.Count('*'));
    expect(compile(stmt)).toBe(
      `SELECT COUNT(1) as count_id FROM (SELECT _t.* FROM (SELECT ROW_NUMBER() OVER (ORDER BY ) as _row_num) as _t WHERE _row_num BETWEEN 1 AND 10) AS subquery`
    );
  });
});
