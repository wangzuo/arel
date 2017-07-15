import * as Arel from '../../Arel';
import Oracle from '../Oracle';
import SQLString from '../../collectors/SQLString';

const _visitor = new Oracle(Arel.Table.engine.connection);
const _table = new Arel.Table('users');

function compile(node) {
  return _visitor
    .accept(node, new SQLString())
    .value.replace(/\s\s+/g, ' ')
    .trim();
}

describe('Oracle', () => {
  it('modifies order when there is distinct and first value', () => {
    const select =
      'DISTINCT foo.id, FIRST_VALUE(projects.name) OVER (foo) AS alias_0__';
    const stmt = new Arel.nodes.SelectStatement();
    stmt.cores[0].projections.push(Arel.sql(select));
    stmt.orders.push(Arel.sql('foo'));
    expect(compile(stmt)).toBe(`SELECT ${select} ORDER BY alias_0__`);
  });

  it('is idempotent with crazy query', () => {
    const select =
      'DISTINCT foo.id, FIRST_VALUE(projects.name) OVER (foo) AS alias_0__';
    const stmt = new Arel.nodes.SelectStatement();
    stmt.cores[0].projections.push(Arel.sql(select));
    stmt.orders.push(Arel.sql('foo'));
    expect(compile(stmt)).toBe(compile(stmt));
  });

  it('splits orders with commas', () => {
    const select =
      'DISTINCT foo.id, FIRST_VALUE(projects.name) OVER (foo) AS alias_0__';
    const stmt = new Arel.nodes.SelectStatement();
    stmt.cores[0].projections.push(Arel.sql(select));
    stmt.orders.push(Arel.sql('foo, bar'));
    expect(compile(stmt)).toBe(
      `SELECT ${select} ORDER BY alias_0__, alias_1__`
    );
  });

  it('splits orders with commas and function calls', () => {
    const select =
      'DISTINCT foo.id, FIRST_VALUE(projects.name) OVER (foo) AS alias_0__';
    const stmt = new Arel.nodes.SelectStatement();
    stmt.cores[0].projections.push(Arel.sql(select));
    stmt.orders.push(Arel.sql('NVL(LOWER(bar, foo), foo) DESC, UPPER(baz)'));
    expect(compile(stmt)).toBe(
      `SELECT ${select} ORDER BY alias_0__ DESC, alias_1__`
    );
  });

  describe('SelectStatement', () => {
    describe('limit', () => {
      it('adds a rownum clause', () => {
        const stmt = new Arel.nodes.SelectStatement();
        stmt.limit = new Arel.nodes.Limit(10);
        expect(compile(stmt)).toBe(`SELECT WHERE ROWNUM <= 10`);
      });

      it('is idempotent', () => {
        const stmt = new Arel.nodes.SelectStatement();
        stmt.orders.push(Arel.sql('foo'));
        stmt.limit = new Arel.nodes.Limit(10);
        expect(compile(stmt)).toBe(compile(stmt));
      });

      it('creates a subquery when there is order by', () => {
        const stmt = new Arel.nodes.SelectStatement();
        stmt.orders.push(Arel.sql('foo'));
        stmt.limit = new Arel.nodes.Limit(10);
        expect(compile(stmt)).toBe(
          `SELECT * FROM (SELECT ORDER BY foo ) WHERE ROWNUM <= 10`
        );
      });

      it('creates a subquery when there is group by', () => {
        const stmt = new Arel.nodes.SelectStatement();
        stmt.cores[0].groups.push(Arel.sql('foo'));
        stmt.limit = new Arel.nodes.Limit(10);
        expect(compile(stmt)).toBe(
          `SELECT * FROM (SELECT GROUP BY foo ) WHERE ROWNUM <= 10`
        );
      });

      it('creates a subquery when there is DISTINCT', () => {
        const stmt = new Arel.nodes.SelectStatement();
        stmt.cores[0].setQuantifier = new Arel.nodes.Distinct();
        stmt.cores[0].projections.push(Arel.sql('id'));
        stmt.limit = new Arel.nodes.Limit(10);
        expect(compile(stmt)).toBe(
          `SELECT * FROM (SELECT DISTINCT id ) WHERE ROWNUM <= 10`
        );
      });

      it('creates a different subquery when there is an offset', () => {
        const stmt = new Arel.nodes.SelectStatement();
        stmt.limit = new Arel.nodes.Limit(10);
        stmt.offset = new Arel.nodes.Offset(10);
        expect(compile(stmt)).toBe(
          `SELECT * FROM ( SELECT raw_sql_.*, rownum raw_rnum_ FROM (SELECT ) raw_sql_ WHERE rownum <= 20 ) WHERE raw_rnum_ > 10`
        );
      });

      it('creates a subquery when there is limit and offset with BindParams', () => {
        const stmt = new Arel.nodes.SelectStatement();
        stmt.limit = new Arel.nodes.Limit(new Arel.nodes.BindParam());
        stmt.offset = new Arel.nodes.Offset(new Arel.nodes.BindParam());
        expect(compile(stmt)).toBe(
          `SELECT * FROM ( SELECT raw_sql_.*, rownum raw_rnum_ FROM (SELECT ) raw_sql_ WHERE rownum <= (:a1 + :a2) ) WHERE raw_rnum_ > :a1`
        );
      });

      // todo
      // it('is idempotent with different subquery', () => {
      //   const stmt = new Arel.nodes.SelectStatement();
      //   stmt.limit = new Arel.nodes.Limit(10);
      //   stmt.offset = new Arel.nodes.Offset(10);
      //   expect(compile(stmt)).toBe(compile(stmt));
      // });
    });

    describe('only offset', () => {
      it('creates a select from subquery with rownum condition', () => {
        const stmt = new Arel.nodes.SelectStatement();
        stmt.offset = new Arel.nodes.Offset(10);
        expect(compile(stmt)).toBe(
          `SELECT * FROM ( SELECT raw_sql_.*, rownum raw_rnum_ FROM (SELECT) raw_sql_ ) WHERE raw_rnum_ > 10`
        );
      });
    });
  });

  it('modified except to be minus', () => {
    const left = Arel.sql('SELECT * FROM users WHERE age > 10');
    const right = Arel.sql('SELECT * FROM users WHERE age > 20');
    expect(compile(new Arel.nodes.Except(left, right))).toBe(
      `( SELECT * FROM users WHERE age > 10 MINUS SELECT * FROM users WHERE age > 20 )`
    );
  });

  describe('locking', () => {
    it('defaults to FOR UPDATE when locking', () => {
      const node = new Arel.nodes.Lock(Arel.sql('FOR UPDATE'));
      expect(compile(node)).toBe(`FOR UPDATE`);
    });
  });

  describe('BindParam', () => {
    it('increments each bind param', () => {
      const query = _table
        .column('name')
        .eq(new Arel.nodes.BindParam())
        .and(_table.column('id').eq(new Arel.nodes.BindParam()));
      expect(compile(query)).toBe(
        `"users"."name" = :a1 AND "users"."id" = :a2`
      );
    });
  });
});
