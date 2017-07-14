import * as Arel from '../../Arel';
import Oracle12 from '../Oracle12';
import SQLString from '../../collectors/SQLString';

const _visitor = new Oracle12(Arel.Table.engine.connection);
const _table = new Arel.Table('users');

function compile(node) {
  return _visitor.accept(node, new SQLString()).value;
}

describe('Oracle12', () => {
  it('modifies except to minus', () => {
    const left = new Arel.sql('SELECT * FROM users WHERE age > 10');
    const right = new Arel.sql('SELECT * FROM users WHERE age > 20');

    expect(compile(new Arel.nodes.Except(left, right))).toBe(
      `( SELECT * FROM users WHERE age > 10 MINUS SELECT * FROM users WHERE age > 20 )`
    );
  });

  it('generates select options offset then limit', () => {
    const stmt = new Arel.nodes.SelectStatement();
    stmt.offset = new Arel.nodes.Offset(1);
    stmt.limit = new Arel.nodes.Limit(10);
    expect(compile(stmt)).toBe('SELECT OFFSET 1 ROWS FETCH FIRST 10 ROWS ONLY');
  });

  describe('locking', () => {
    it('generates error if limit and lock are used', () => {
      const stmt = new Arel.nodes.SelectStatement();
      stmt.limit = new Arel.nodes.Limit(1);
      stmt.lock = new Arel.nodes.Lock(Arel.sql('FOR UPDATE'));

      expect(() => compile(stmt)).toThrow(/Combination of limit and lock/);
    });

    it('defaults to FOR UPDATE when locking', () => {
      expect(compile(new Arel.nodes.Lock(Arel.sql('FOR UPDATE')))).toBe(
        'FOR UPDATE'
      );
    });
  });

  describe('BindParam', () => {
    it('increments each bind param', () => {
      const { BindParam } = Arel.nodes;
      const query = _table
        .column('name')
        .eq(new BindParam())
        .and(_table.column('id').eq(new BindParam()));
      expect(compile(query)).toBe(
        `"users"."name" = :a1 AND "users"."id" = :a2`
      );
    });
  });
});
