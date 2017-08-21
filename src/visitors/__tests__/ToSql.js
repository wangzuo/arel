import * as Arel from '../../Arel';
import ToSql from '../ToSql';

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
  Equality,
  NotEqual
} = Arel.nodes;
const { SQLString } = Arel.collectors;
const { Reduce } = Arel.visitors;

let conn = null;
let visitor = null;
let table = null;
let attr = null;

function compile(node) {
  return visitor.accept(node, new SQLString()).value;
}

beforeEach(() => {
  visitor = new ToSql(Table.engine.connection);
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

  it('should visit named functions', () => {
    const func = new NamedFunc('omg', [Arel.star()]);
    expect(compile(func)).toBe('omg(*)');
  });

  it('should chain predications on named functions', () => {
    const func = new NamedFunc('omg', [Arel.star()]);
    expect(compile(func.eq(2))).toBe('omg(*) = 2');
  });

  it('should handle null with named functions', () => {
    const func = new NamedFunc('omg', [Arel.star()]);
    expect(compile(func.eq(null))).toBe('omg(*) IS NULL');
  });

  it('should visit built-in functions', () => {
    expect(compile(new Arel.nodes.Count([Arel.star()]))).toBe('COUNT(*)');
    expect(compile(new Arel.nodes.Sum([Arel.star()]))).toBe('SUM(*)');
    expect(compile(new Arel.nodes.Max([Arel.star()]))).toBe('MAX(*)');
    expect(compile(new Arel.nodes.Min([Arel.star()]))).toBe('MIN(*)');
    expect(compile(new Arel.nodes.Avg([Arel.star()]))).toBe('AVG(*)');
  });

  it('should visit built-in functions operating on distinct values', () => {
    const f1 = new Count([Arel.star()]);
    f1.distinct = true;
    expect(compile(f1)).toBe('COUNT(DISTINCT *)');

    const f2 = new Sum([Arel.star()]);
    f2.distinct = true;
    expect(compile(f2)).toBe('SUM(DISTINCT *)');

    const f3 = new Max([Arel.star()]);
    f3.distinct = true;
    expect(compile(f3)).toBe('MAX(DISTINCT *)');

    const f4 = new Min([Arel.star()]);
    f4.distinct = true;
    expect(compile(f4)).toBe('MIN(DISTINCT *)');

    const f5 = new Avg([Arel.star()]);
    f5.distinct = true;
    expect(compile(f5)).toBe('AVG(DISTINCT *)');
  });

  it('works with lists', () => {
    const func = new NamedFunc('omg', [Arel.star(), Arel.star()]);
    expect(compile(func)).toBe('omg(*, *)');
  });

  describe('Equality', () => {
    it('should escape strings', () => {
      const test = new Table('users').column('name').eq('Aaron Patterson');
      expect(compile(test)).toBe(`"users"."name" = 'Aaron Patterson'`);
    });

    it('should handle false', () => {
      const table = new Table('users');
      const val = Arel.nodes.buildQuoted(false, table.column('active'));
      const sql = compile(new Equality(val, val));
      expect(sql).toBe(`'f' = 'f'`);
    });

    it('should handle null', () => {
      const sql = compile(new Equality(table.column('name'), null));
      expect(sql).toBe(`"users"."name" IS NULL`);
    });
  });

  describe('Grouping', () => {
    it('wraps nested groupings in brackets only once', () => {
      const sql = compile(new Grouping(new Grouping(buildQuoted('foo'))));
      expect(sql).toBe(`('foo')`);
    });
  });

  describe('NotEqual', () => {
    it('should handle false', () => {
      const val = buildQuoted(false, table.column('active'));
      const sql = compile(new NotEqual(table.column('active'), val));
      expect(sql).toBe(`"users"."active" != 'f'`);
    });

    it('should handle null', () => {
      const val = buildQuoted(null, table.column('active'));
      const sql = compile(new NotEqual(table.column('name'), val));
      expect(sql).toBe('"users"."name" IS NOT NULL');
    });
  });

  // TODO
  // it('should visit string subclass', () => {});
  // it('should visit_Class', () => {});

  it('should escape LIMIT', () => {
    const sc = new SelectStatement();
    sc.limit = new Limit(buildQuoted('omg'));
    expect(compile(sc)).toBe(`SELECT LIMIT 'omg'`);
  });

  it('should contain a single space before ORDER BY', () => {
    const table = new Table('users');
    const test = table.order(table.column('name'));
    expect(compile(test)).toBe(`(SELECT FROM "users" ORDER BY "users"."name")`);
  });

  it('should quote LIMIT without column type coercion', () => {
    const table = new Table('users');
    const sc = table.where(table.column('name').eq(0)).take(1).ast;
    expect(compile(sc)).toBe(
      `SELECT  FROM "users" WHERE "users"."name" = 0 LIMIT 1`
    );
  });

  // TODO
  // it('should visitDateTime', () => {});
  // it('should visitFloat', () => {});
  // it('should visit_Not', () => {});

  it('should apply Not to the whole expression', () => {
    const table = new Arel.Table('users');
    const attr = table.column('id');
    const node = new Arel.nodes.And([attr.eq(10), attr.eq(11)]);
    expect(compile(new Arel.nodes.Not(node))).toBe(
      `NOT ("users"."id" = 10 AND "users"."id" = 11)`
    );
  });

  it('should visitAs', () => {
    const as = new Arel.nodes.As(Arel.sql('foo'), Arel.sql('bar'));
    expect(compile(as)).toBe('foo AS bar');
  });

  // TODO
  // it('should visitBignum', () => {});
  // it('should visitHash', () => {});
  // it('should visitSet', () => {});
  // it('should visitBigDecimal', () => {});
  // it('should visitDate', () => {});
  // it('should visitNilClass', () => {});
  // it('unsupported input should raise UnsupportedVisitError', () => {});

  it('should visitSelectManager, which is a subquery', () => {
    const mgr = new Arel.Table('foo').project('bar');
    expect(compile(mgr)).toBe(`(SELECT bar FROM "foo")`);
  });

  it('should visitAnd', () => {
    const table = new Arel.Table('users');
    const attr = table.column('id');
    const node = new Arel.nodes.And([attr.eq(10), attr.eq(11)]);
    expect(compile(node)).toBe(`"users"."id" = 10 AND "users"."id" = 11`);
  });

  it('should visitOr', () => {
    const node = new Arel.nodes.Or(attr.eq(10), attr.eq(11));
    expect(compile(node)).toBe(`"users"."id" = 10 OR "users"."id" = 11`);
  });

  it('should visitAssignment', () => {
    const table = new Arel.Table('users');
    const column = table.column('id');
    const node = new Arel.nodes.Assignment(
      new Arel.nodes.UnqualifiedColumn(column),
      new Arel.nodes.UnqualifiedColumn(column)
    );

    expect(compile(node)).toBe(`"id" = "id"`);
  });

  // TODO
  // it('should visitAttributesTime', () => {});
  // it('should visitTrueClass', () => {});

  describe('Nodes.Matches', () => {
    it('should know how to visit', () => {
      const node = table.column('name').matches('foo%');
      expect(compile(node)).toBe(`"users"."name" LIKE 'foo%'`);
    });

    it('can handle ESCAPE', () => {
      const node = table.column('name').matches('foo!%', '!');
      expect(compile(node)).toBe(`"users"."name" LIKE 'foo!%' ESCAPE '!'`);
    });

    it('can handle subqueries', () => {
      const subquery = table
        .project('id')
        .where(table.column('name').matches('foo%'));
      const node = attr.in(subquery);
      expect(compile(node)).toBe(
        `"users"."id" IN (SELECT id FROM "users" WHERE "users"."name" LIKE 'foo%')`
      );
    });
  });

  describe('Nodes.DoesNotMatch', () => {
    it('should know how to visit', () => {
      const node = table.column('name').doesNotMatch('foo%');
      expect(compile(node)).toBe(`"users"."name" NOT LIKE 'foo%'`);
    });

    it('can handle ESCAPE', () => {
      const node = table.column('name').doesNotMatch('foo!%', '!');
      expect(compile(node)).toBe(`"users"."name" NOT LIKE 'foo!%' ESCAPE '!'`);
    });

    it('can handle subqueries', () => {
      const subquery = table
        .project('id')
        .where(table.column('name').doesNotMatch('foo%'));
      const node = attr.in(subquery);
      expect(compile(node)).toBe(
        `"users"."id" IN (SELECT id FROM "users" WHERE "users"."name" NOT LIKE 'foo%')`
      );
    });
  });

  describe('Nodes.Ordering', () => {
    it('should know how to visit', () => {
      const table = new Arel.Table('users');
      const node = table.column('id').desc();
      expect(compile(node)).toBe(`"users"."id" DESC`);
    });
  });

  describe('Nodes.In', () => {
    it('should know how to visit', () => {
      const node = attr.in([1, 2, 3]);
      expect(compile(node)).toBe(`"users"."id" IN (1, 2, 3)`);
    });

    it('should return 1=0 when empty right which is always false', () => {
      const node = attr.in([]);
      expect(compile(node)).toBe(`1=0`);
    });

    // TODO
    // it('can handle two dot ranges', () => {
    //   const node = attr.between(1, 3);
    //   expect(compile(node)).toBe(`"users"."id" BETWEEN 1 AND 3`);
    // });
    // it('can handle three dot ranges', () => {});
    // it('can handle ranges bounded by infinity', () => {});

    it('can handle subqueries', () => {
      const subquery = table
        .project('id')
        .where(table.column('name').eq('Aaron'));
      const node = attr.in(subquery);
      expect(compile(node)).toBe(
        `"users"."id" IN (SELECT id FROM "users" WHERE "users"."name" = 'Aaron')`
      );
    });
  });

  describe('Nodes.InfixOperation', () => {
    it('should handle Multiplication', () => {
      const price = new Arel.attributes.Decimal(new Table('products'), 'price');
      const rate = new Arel.attributes.Decimal(
        new Table('currency_rates'),
        'rate'
      );
      const node = price.multiple(rate);

      expect(compile(node)).toBe(
        `"products"."price" * "currency_rates"."rate"`
      );
    });

    it('should handle Division', () => {
      const node = new Arel.attributes.Decimal(
        new Table('products'),
        'price'
      ).divide(5);
      expect(compile(node)).toBe(`"products"."price" / 5`);
    });

    it('should handle Addition', () => {
      const node = new Arel.attributes.Decimal(
        new Table('products'),
        'price'
      ).add(6);
      expect(compile(node)).toBe(`"products"."price" + 6`);
    });

    it('should handle Subtraction', () => {
      const node = new Arel.attributes.Decimal(
        new Table('products'),
        'price'
      ).sub(7);
      expect(compile(node)).toBe(`"products"."price" - 7`);
    });

    it('should handle Concatination', () => {
      const node = table.column('name').concat(table.column('name'));
      expect(compile(node)).toBe(`"users"."name" || "users"."name"`);
    });

    it('should handle BitwiseAnd', () => {
      const node = new Arel.attributes.Integer(
        new Table('products'),
        'bitmap'
      ).bitwiseAnd(16);
      expect(compile(node)).toBe(`("products"."bitmap" & 16)`);
    });

    it('should handle BitwiseOr', () => {
      const node = new Arel.attributes.Integer(
        new Table('products'),
        'bitmap'
      ).bitwiseOr(16);
      expect(compile(node)).toBe(`("products"."bitmap" | 16)`);
    });

    it('should handle BitwiseXor', () => {
      const node = new Arel.attributes.Integer(
        new Table('products'),
        'bitmap'
      ).bitwiseXor(16);
      expect(compile(node)).toBe(`("products"."bitmap" ^ 16)`);
    });

    it('should handle BitwiseShiftLeft', () => {
      const node = new Arel.attributes.Integer(
        new Table('products'),
        'bitmap'
      ).bitwiseShiftLeft(4);
      expect(compile(node)).toBe(`("products"."bitmap" << 4)`);
    });

    it('should handle BitwiseShiftRight', () => {
      const node = new Arel.attributes.Integer(
        new Table('products'),
        'bitmap'
      ).bitwiseShiftRight(4);
      expect(compile(node)).toBe(`("products"."bitmap" >> 4)`);
    });

    it('should handle arbitrary operators', () => {
      const node = new Arel.nodes.InfixOperation(
        '&&',
        new Arel.attributes.String(new Table('products'), 'name'),
        new Arel.attributes.String(new Table('products'), 'name')
      );
      expect(compile(node)).toBe(`"products"."name" && "products"."name"`);
    });
  });

  // TODO
  // describe('Nodes.UnaryOperation', () => {
  //   it('should handle BitwiseNot', () => {});
  //   it('should handle arbitrary operators', () => {});
  // });

  describe('Nodes.NotIn', () => {
    it('should know how to visit', () => {
      const node = attr.notIn([1, 2, 3]);
      expect(compile(node)).toBe(`"users"."id" NOT IN (1, 2, 3)`);
    });

    it('should return 1=1 when empty right which is always true', () => {});
    it('can handle two dot ranges', () => {});
    it('can handle three dot ranges', () => {});
    it('can handle ranges bounded by infinity', () => {});
    it('can handle subqueries', () => {});
  });

  describe('Constants', () => {
    it('should handle true', () => {
      expect(compile(new Table('users').createTrue())).toBe('TRUE');
    });

    it('should handle false', () => {
      expect(compile(new Table('users').createFalse())).toBe('FALSE');
    });
  });

  describe('TableAlias', () => {
    it('should use the underlying table for checking columns', () => {
      expect(compile(table.alias('zomgusers').column('id').eq('3'))).toBe(
        `"zomgusers"."id" = '3'`
      );
    });
  });

  // TODO
  // describe('distinct on', () => {});
  // describe('Nodes.Regexp', () => {});
  // describe('Nodes.NotRegexp', () => {});

  describe('Nodes.Case', () => {
    it('supports simple case expressions', () => {
      const node = new Arel.nodes.Case(table.column('name'))
        .when('foo')
        .then(1);
      expect(compile(node)).toBe(`CASE "users"."name" WHEN 'foo' THEN 1 END`);
    });

    it('supports extended case expressions', () => {
      const node = new Arel.nodes.Case()
        .when(table.column('name').in(['foo', 'bar']))
        .then(1)
        .else(0);

      expect(compile(node)).toBe(
        `CASE WHEN "users"."name" IN ('foo', 'bar') THEN 1 ELSE 0 END`
      );
    });

    it('works without default branch', () => {
      const node = new Arel.nodes.Case(table.column('name'))
        .when('foo')
        .then(1);
      expect(compile(node)).toBe(`CASE "users"."name" WHEN 'foo' THEN 1 END`);
    });

    it('allows chaining multiple conditions', () => {
      const node = new Arel.nodes.Case(table.column('name'))
        .when('foo')
        .then(1)
        .when('bar')
        .then(2)
        .else(0);
      expect(compile(node)).toBe(
        `CASE "users"."name" WHEN 'foo' THEN 1 WHEN 'bar' THEN 2 ELSE 0 END`
      );
    });

    it('supports #when with two arguments and no #then', () => {
      const node = new Arel.nodes.Case(table.column('name'));
      node.when('foo', 1).when('bar', 0);
      expect(compile(node)).toBe(
        `CASE "users"."name" WHEN 'foo' THEN 1 WHEN 'bar' THEN 0 END`
      );
    });

    it('can be chained as a predicate', () => {
      const node = table.column('name').when('foo').then('bar').else('baz');
      expect(compile(node)).toBe(
        `CASE "users"."name" WHEN 'foo' THEN 'bar' ELSE 'baz' END`
      );
    });
  });
});
