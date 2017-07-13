import * as Arel from '../../Arel';
import PostgreSQL from '../PostgreSQL';
import SQLString from '../../collectors/SQLString';

const { Table } = Arel;
const {
  Lock,
  SelectStatement,
  Limit,
  buildQuoted,
  GroupingSet,
  BindParam,
  GroupingElement,
  RollUp,
  SelectCore,
  Matches,
  DoesNotMatch,
  Regexp,
  NotRegexp,
  Distinct,
  DistinctOn,
  Cube
} = Arel.nodes;
const _visitor = new PostgreSQL(Table.engine.connection);
const _table = new Table('users');
const _attr = _table.column('id');

function compile(node) {
  return _visitor.accept(node, new SQLString()).value;
}

describe('PostgreSQL', () => {
  describe('locking', () => {
    it('defaults to FOR UPDATE', () => {
      expect(compile(new Lock(Arel.sql('FOR UPDATE')))).toBe('FOR UPDATE');
    });

    it('allows a custom string to be used as a lock', () => {
      const node = expect(compile(new Lock(Arel.sql('FOR SHARE')))).toBe(
        'FOR SHARE'
      );
    });
  });

  it('should escape LIMIT', () => {
    const sc = new SelectStatement();
    sc.limit = new Limit(buildQuoted('omg'));
    sc.cores[0].projections.push(Arel.sql('DISTINCT ON'));
    sc.orders.push(Arel.sql('xyz'));
    expect(compile(sc)).toBe(`SELECT DISTINCT ON ORDER BY xyz LIMIT 'omg'`);
  });

  it('should support DISTINCT ON', () => {
    const core = new SelectCore();
    core.setQuantifier = new DistinctOn(Arel.sql('aaron'));
    expect(compile(core)).toBe(`SELECT DISTINCT ON ( aaron )`);
  });

  it('should support DISTINCT', () => {
    const core = new SelectCore();
    core.setQuantifier = new Distinct();
    expect(compile(core)).toBe(`SELECT DISTINCT`);
  });

  describe('Nodes::Matches', () => {
    it('should know how to visit', () => {
      const node = _table.column('name').matches('foo%');
      expect(node).toBeInstanceOf(Matches);
      expect(node.caseSensitive).toBe(false);
      expect(compile(node)).toBe(`"users"."name" ILIKE 'foo%'`);
    });

    it('should know how to visit case sensitive', () => {
      const node = _table.column('name').matches('foo%', null, true);
      expect(node.caseSensitive).toBe(true);
      expect(compile(node)).toBe(`"users"."name" LIKE 'foo%'`);
    });

    it('can handle ESCAPE', () => {
      const node = _table.column('name').matches('foo!%', '!');
      expect(compile(node)).toBe(`"users"."name" ILIKE 'foo!%' ESCAPE '!'`);
    });

    it('can handle subqueries', () => {
      const subquery = _table
        .project('id')
        .where(_table.column('name').matches('foo%'));
      const node = _attr.in(subquery);
      expect(compile(node)).toBe(
        `"users"."id" IN (SELECT id FROM "users" WHERE "users"."name" ILIKE 'foo%')`
      );
    });
  });

  describe('Nodes::DoesNotMatch', () => {
    it('should know how to visit', () => {
      const node = _table.column('name').doesNotMatch('foo%');
      expect(node).toBeInstanceOf(DoesNotMatch);
      expect(node.caseSensitive).toBe(false);
      expect(compile(node)).toBe(`"users"."name" NOT ILIKE 'foo%'`);
    });

    it('should know how to visit case sensitive', () => {
      const node = _table.column('name').doesNotMatch('foo%', null, true);
      expect(node.caseSensitive).toBe(true);
      expect(compile(node)).toBe(`"users"."name" NOT LIKE 'foo%'`);
    });

    it('can handle ESCAPE', () => {
      const node = _table.column('name').doesNotMatch('foo!%', '!');
      expect(compile(node)).toBe(`"users"."name" NOT ILIKE 'foo!%' ESCAPE '!'`);
    });

    it('can handle subqueries', () => {
      const subquery = _table
        .project('id')
        .where(_table.column('name').doesNotMatch('foo%'));
      const node = _attr.in(subquery);
      expect(compile(node)).toBe(
        `"users"."id" IN (SELECT id FROM "users" WHERE "users"."name" NOT ILIKE 'foo%')`
      );
    });
  });

  describe('Nodes::Regexp', () => {
    it('should know how to visit', () => {
      const node = _table.column('name').matchesRegexp('foo.*');
      expect(node).toBeInstanceOf(Regexp);
      expect(node.caseSensitive).toBe(true);
      expect(compile(node)).toBe(`"users"."name" ~ 'foo.*'`);
    });

    it('can handle case insensitive', () => {
      const node = _table.column('name').matchesRegexp('foo.*', false);

      expect(node).toBeInstanceOf(Regexp);
      expect(node.caseSensitive).toBe(false);
      expect(compile(node)).toBe(`"users"."name" ~* 'foo.*'`);
    });

    it('can handle subqueries', () => {
      const subquery = _table
        .project('id')
        .where(_table.column('name').matchesRegexp('foo.*'));
      const node = _attr.in(subquery);
      expect(compile(node)).toBe(
        `"users"."id" IN (SELECT id FROM "users" WHERE "users"."name" ~ 'foo.*')`
      );
    });
  });

  describe('Nodes::NotRegexp', () => {
    it('should know how to visit', () => {
      const node = _table.column('name').doesNotMatchRegexp('foo.*');
      expect(node).toBeInstanceOf(NotRegexp);
      expect(node.caseSensitive).toBe(true);
      expect(compile(node)).toBe(`"users"."name" !~ 'foo.*'`);
    });

    it('can handle case insensitive', () => {
      const node = _table.column('name').doesNotMatchRegexp('foo.*', false);
      expect(node.caseSensitive).toBe(false);
      expect(compile(node)).toBe(`"users"."name" !~* 'foo.*'`);
    });

    it('can handle subqueries', () => {
      const subquery = _table
        .project('id')
        .where(_table.column('name').doesNotMatchRegexp('foo.*'));
      const node = _attr.in(subquery);
      expect(compile(node)).toBe(
        `"users"."id" IN (SELECT id FROM "users" WHERE "users"."name" !~ 'foo.*')`
      );
    });
  });

  describe('Nodes::BindParam', () => {
    it('increments each bind param', () => {
      const query = _table
        .column('name')
        .eq(new BindParam())
        .and(_table.column('id').eq(new BindParam()));
      expect(compile(query)).toBe(`"users"."name" = $1 AND "users"."id" = $2`);
    });
  });

  describe('Nodes::Cube', () => {
    it('should know how to visit with array arguments', () => {
      const node = new Cube([_table.column('name'), _table.column('bool')]);
      expect(compile(node)).toBe(`CUBE( "users"."name", "users"."bool" )`);
    });

    it('should know how to visit with CubeDimension Argument', () => {
      const dimensions = new GroupingElement([
        _table.column('name'),
        _table.column('bool')
      ]);
      const node = new Cube(dimensions);
      expect(compile(node)).toBe(`CUBE( "users"."name", "users"."bool" )`);
    });

    it('should know how to generate paranthesis when supplied with many Dimensions', () => {
      const dim1 = new GroupingElement(_table.column('name'));
      const dim2 = new GroupingElement([
        _table.column('bool'),
        _table.column('created_at')
      ]);
      const node = new Cube([dim1, dim2]);
      expect(compile(node)).toBe(
        `CUBE( ( "users"."name" ), ( "users"."bool", "users"."created_at" ) )`
      );
    });
  });

  describe('Nodes::GroupingSet', () => {
    it('should know how to visit with array arguments', () => {
      const node = new GroupingSet([
        _table.column('name'),
        _table.column('bool')
      ]);
      expect(compile(node)).toBe(
        `GROUPING SET( "users"."name", "users"."bool" )`
      );
    });

    it('should know how to visit with CubeDimension Argument', () => {
      const group = new GroupingElement([
        _table.column('name'),
        _table.column('bool')
      ]);
      const node = new GroupingSet(group);
      expect(compile(node)).toBe(
        `GROUPING SET( "users"."name", "users"."bool" )`
      );
    });

    it('should know how to generate paranthesis when supplied with many Dimensions', () => {
      const group1 = new GroupingElement(_table.column('name'));
      const group2 = new GroupingElement([
        _table.column('bool'),
        _table.column('created_at')
      ]);
      const node = new GroupingSet([group1, group2]);
      expect(compile(node)).toBe(
        `GROUPING SET( ( "users"."name" ), ( "users"."bool", "users"."created_at" ) )`
      );
    });
  });

  describe('Nodes::RollUp', () => {
    it('should know how to visit with array arguments', () => {
      const node = new RollUp([_table.column('name'), _table.column('bool')]);
      expect(compile(node)).toBe(`ROLLUP( "users"."name", "users"."bool" )`);
    });

    it('should know how to visit with CubeDimension Argument', () => {
      const group = new GroupingElement([
        _table.column('name'),
        _table.column('bool')
      ]);
      const node = new RollUp(group);
      expect(compile(node)).toBe(`ROLLUP( "users"."name", "users"."bool" )`);
    });

    it('should know how to generate paranthesis when supplied with many Dimensions', () => {
      const group1 = new GroupingElement(_table.column('name'));
      const group2 = new GroupingElement([
        _table.column('bool'),
        _table.column('created_at')
      ]);
      const node = new RollUp([group1, group2]);
      expect(compile(node)).toBe(
        `ROLLUP( ( "users"."name" ), ( "users"."bool", "users"."created_at" ) )`
      );
    });
  });
});
