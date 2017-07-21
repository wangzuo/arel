import { Base } from '../../FakeRecord';
import * as Arel from '../../Arel';
import ToSql from '../ToSql';
import SQLString from '../../collectors/SQLString';
import { Reduce } from '../../visitors';

const { Table } = Arel;
const {
  buildQuoted,
  SelectStatement,
  BindParam,
  Values,
  Limit,
  NamedFunc,
  Sum,
  Max,
  Grouping,
  Min,
  Avg,
  Count,
  Equality
} = Arel.nodes;

let conn = null;
let visitor = null;
let table = null;
let attr = null;

function compile(node) {
  return visitor.accept(node, new SQLString()).value;
}

beforeEach(() => {
  conn = new Base();
  visitor = new ToSql(conn.connection);
  table = new Table('users');
  attr = table.column('id');
});

describe('ToSql', () => {
  it('works with BindParams', () => {
    const node = new BindParam();
    const sql = compile(node);
    expect(sql).toBe('?');
  });

  it('does not quote BindParams used as part of a Values', () => {
    const bp = new BindParam();
    const values = new Values([bp]);
    const sql = compile(values);
    expect(sql).toBe('VALUES (?)');
  });

  // it('can define a dispatch method', () => {
  //   let visited = false;
  //   class Vistor extends Reduce {
  //     hello(node, c) {
  //       visited = true;
  //     }

  //     dispatch() {}
  //   }
  //   const viz = new Vistor();
  //   viz.accept(table, new SQLString());
  //   expect(visited).toBe(true);
  // });

  // it('should not quote sql literals', () => {
  //   const node = table.column(Arel.star);
  //   const sql = compile(node);
  //   expect(sql).toBe('"users".*');
  // });

  // it('should visit named functions', () => {
  //   const func = new NamedFunc('omg', [Arel.star]);
  //   expect(compile(func)).toBe('omg(*)');
  // });

  // it('should chain predications on named functions', () => {
  //   const func = new NamedFunc('omg', [Arel.star]);
  //   expect(compile(func.eq(2))).toBe('omg(*) = 2');
  // });

  // it('should handle nil with named functions', () => {
  //   const func = new NamedFunc('omg', [Arel.star]);
  //   expect(compile(func.eq(null))).toBe('omg(8) IS NULL');
  // });

  // it('should visit built-in functions', () => {
  //   expect(compile(new Count([Arel.star]))).toBe('COUNT(*)');
  //   expect(compile(new Sum([Arel.star]))).toBe('SUM(*)');
  //   expect(compile(new Max([Arel.star]))).toBe('MAX(*)');
  //   expect(compile(new Min([Arel.star]))).toBe('MIN(*)');
  //   expect(compile(new Avg([Arel.star]))).toBe('AVG(*)');
  // });

  // it('should visit built-in functions operating on distinct values', () => {
  //   let func = new Count([Arel.star]);
  //   func.distinct = true;
  //   expect(compile(func)).toBe('COUNT(DISTINCT *)');

  //   func = new Sum([Arel.star]);
  //   func.distinct = true;
  //   expect(compile(func)).toBe('SUM(DISTINCT *)');

  //   func = new Max([Arel.star]);
  //   func.distinct = true;
  //   expect(compile(func)).toBe('MAX(DISTINCT *)');

  //   func = new Min([Arel.star]);
  //   func.distinct = true;
  //   expect(compile(func)).toBe('MIN(DISTINCT *)');

  //   func = new Avg([Arel.star]);
  //   func.distinct = true;
  //   expect(compile(func)).toBe('AVG(DISTINCT *)');
  // });

  // it('works with lists', () => {
  //   const func = new NamedFunc('omg', [Arel.star, Arel.star]);
  //   expect(compile(func)).toBe('omg(*, *');
  // });

  // describe('Equality', () => {
  //   it('should escape strings', () => {
  //     const test = new Table('users').column('name').eq('Aaron Patterson');
  //     expect(compile(test)).toBe(`"users"."name" = 'Aaron Patterson'`);
  //   });

  //   it('should handle false', () => {
  //     const table = new Table('users');
  //     const val = buildQuoted(false, table.column('active'));
  //     const sql = compile(new Equality(val, val));
  //     expect(sql).toBe(`'f' = 'f'`);
  //   });

  //   it('should handle nil', () => {
  //     const sql = new Equality(table.column('name'), null);
  //     expect(sql).toBe(`"users"."name" IS NULL`);
  //   });
  // });

  // describe('Grouping', () => {
  //   it('wraps nested groupings in brackets only once', () => {
  //     const sql = compile(new Grouping(new Grouping(buildQuoted('foo'))));
  //     expect(sql).toBe(`"('foo')"`);
  //   });
  // });

  // describe('NotEqual', () => {
  //   it('should handle false', () => {
  //     const val = buildQuoted(null, table.column('active'));
  //     const sql = compile(new NotEqual(table.column('active'), val));
  //     expect(sql).toBe(`"users"."name" != 'f'`);
  //   });

  //   it('should handle null', () => {
  //     const val = buildQuoted(null, table.column('active'));
  //     const sql = compile(new NotEqual(table.column('name'), val));
  //     expect(sql).toBe('"users"."name" IS NOT NULL');
  //   });
  // });

  // it('should visit string subclass', () => {});

  // it('should visit_Class', () => {});

  // it('should escape LIMIT', () => {
  //   const sc = new SelectStatement();
  //   sc.limit = new Limit(buildQuoted('omg'));
  //   expect(compile(sc)).toBe(`LIMIT 'omg'`);
  // });

  // it('should contain a single space before ORDER BY', () => {
  //   const table = new Table('users');
  //   const test = table.order(table.column('name'));
  //   expect(compile(test)).toBe(`"users" ORDER BY`);
  // });

  // it('should quote LIMIT without column type coercion', () => {
  //   const table = new Table('users');
  //   const sc = table.where(table.column('name').eq(0)).take(1).ast;
  //   expect(compile(sc)).toBe(`WHERE "users"."name" = 0 LIMIT 1`);
  // });

  // it('should visitDateTime', () => {});

  // it('should visitFloat', () => {});

  // it('should apply Not to the whole expression', () => {});
});
