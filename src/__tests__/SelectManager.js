import _ from 'lodash';
import { Base } from '../__fixtures__/FakeRecord';
import Arel, { Table } from '../';
import SelectManager from '../SelectManager';
import { SqlLiteral, Grouping, And } from '../nodes';

Table.engine = new Base();

describe('SelectManager', () => {
  function testJoinSources() {
    const manager = new SelectManager();
    manager.joinSources.push(new StringJoin(Nodes.build_quoted('foot')));
    expect(manager.toSql()).toEqual(`SELECT FROM 'foo'`);
  }

  function testManagerStoresBindValues() {
    const manager = new SelectManager();
    expect(manager.bindValues).toEqual([]);
    manager.bindValues = [1];
    expect(manager.bindValues).toEqual([1]);
  }

  describe('backwards compatibility', () => {
    describe('project', () => {
      it('accepts strings as sql literals', () => {
        const table = new Table('users');
        const manager = new SelectManager();
        manager.project('id');
        manager.from(table);
        expect(manager.toSql()).toBe(`SELECT id FROM "users"`);
      });
    });

    describe('order', () => {
      it('accepts strings', () => {
        const table = new Table('users');
        const manager = new SelectManager();
        manager.project(new SqlLiteral('*'));
        manager.from(table);
        manager.order('foo');
        expect(manager.toSql()).toBe(`SELECT * FROM "users" ORDER BY foo`);
      });
    });

    describe('group', () => {
      it('takes a symbol', () => {
        const table = new Table('users');
        const manager = new SelectManager();
        manager.from(table);
        manager.group('foo');
        expect(manager.toSql()).toBe(`SELECT FROM "users" GROUP BY foo`);
      });
    });

    describe('as', () => {
      it('makes an AS node by grouping the AST', () => {
        const manager = new SelectManager();
        const as = manager.as(Arel.sql('foo'));
        expect(as.left).toBeInstanceOf(Grouping);
        expect(manager.ast).toBe(as.left.expr);
        expect(as.right.toString()).toBe('foo');
      });

      it('converts right to SqlLiteral if a string', () => {
        const manager = new SelectManager();
        const as = manager.as('foot');
        expect(as.right).toBeInstanceOf(SqlLiteral);
      });

      it('can make a subselect', () => {
        let manager = new SelectManager();
        manager.project(Arel.star);
        manager.from(Arel.sql('zomg'));
        const as = manager.as(Arel.sql('foo'));

        manager = new SelectManager();
        manager.project(Arel.sql('name'));
        manager.from(as);
        expect(manager.toSql()).toBe(
          'SELECT name FROM (SELECT * FROM zomg) foo'
        );
      });
    });

    describe('from', () => {
      it('ignores strings when table of same name exists', () => {
        const table = new Table('users');
        const manager = new SelectManager();
        manager.from(table);
        manager.from('users');
        manager.project(table.column('id'));
        expect(manager.toSql()).toBe(`SELECT "users"."id" FROM users`);
      });

      it('should support any ast', () => {
        const table = new Table('users');
        const manager1 = new SelectManager();
        const manager2 = new SelectManager();
        manager2.project(Arel.sql('*'));
        manager2.from(table);

        manager1.project(Arel.sql('lol'));
        const as = manager2.as(Arel.sql('omg'));
        manager1.from(as);

        expect(manager1.toSql()).toBe(
          `SELECT lol FROM (SELECT * FROM "users") omg`
        );
      });
    });

    describe('having', () => {
      it('converts strings to SqlLiterals', () => {
        const table = new Table('users');
        const mgr = table.from();
        mgr.having(Arel.sql('foo'));
        expect(mgr.toSql()).toBe('SELECT FROM "users" HAVING foo');
      });

      it('can have multiple items specified separately', () => {
        const table = new Table('users');
        const mgr = table.from();
        mgr.having(Arel.sql('foo'));
        mgr.having(Arel.sql('bar'));
        expect(mgr.toSql()).toBe('SELECT FROM "users" HAVING foo AND bar');
      });

      it('can receive any node', () => {
        const table = new Table('users');
        const mgr = table.from();
        mgr.having(new And([Arel.sql('foo'), Arel.sql('bar')]));
        expect(mgr.toSql()).toBe('SELECT FROM "users" HAVING foo AND bar');
      });
    });

    describe('on', () => {
      it('converts to SqlLiterals', () => {
        const table = new Table('users');
        const right = table.alias();
        const mgr = table.from();
        mgr.join(right).on('omg');
        expect(mgr.toSql()).toBe(
          'SELECT FROM "users" INNER JOIN "users" "users_2" ON omg'
        );
      });

      it('converts to SqlLiterals with multiple items', () => {
        const table = new Table('users');
        const right = table.alias();
        const mgr = table.from();
        mgr.join(right).on('omg', '123');
        expect(mgr.toSql()).toBe(
          'SELECT FROM "users" INNER JOIN "users" "users_2" ON omg AND 123'
        );
      });
    });

    // describe('clone', () => {
    //   it('creates new cores', () => {
    //     const table = new Table('users', { as: 'foo' });
    //     const mgr = table.from();
    //     const m2 = mgr.clone();
    //     m2.project('foo');
    //     expect(mgr.toSql()).not.toBe(m2.toSql());
    //   });

    //   it('makes updates to the correct copy', () => {
    //     const table = new Table('users', { as: 'foo' });
    //     const mgr = table.from();
    //     const m2 = mgr.clone();
    //     const m3 = m2.clone();
    //     m2.project('foo');
    //     expect(mgr.toSql()).not.toBe(m2.toSql());
    //     expect(m3.toSql()).toBe(mgr.toSql());
    //   });
    // });

    describe('project', () => {
      it('takes sql literals', () => {
        const manager = new SelectManager();
        manager.project(new SqlLiteral('*'));
        expect(manager.toSql()).toBe('SELECT *');
      });

      it('takes multiple args', () => {
        const manager = new SelectManager();
        manager.project(new SqlLiteral.new('foo'), new SqlLiteral.new('bar'));
        expect(manager.toSql()).toBe('SELECT foo, bar');
      });

      it('takes strings', () => {
        const manager = new SelectManager();
        manager.project('*');
        expect(manager.toSql()).toBe('SELECT *');
      });
    });

    describe('projections', () => {
      it('reads projections', () => {
        const manager = new SelectManager();
        manager.project(Arel.sql('foo'), Arel.sql('bar'));
        expect(manager.projections).toEqual([Arel.sql('foo'), Arel.sql('bar')]);
      });
    });

    describe('projections=', () => {
      it('overwrites projections', () => {
        const manager = new SelectManager();
        manager.project(Arel.sql('foo'));
        manager.projections = [Arel.sql('bar')];
        expect(manager.toSql()).toBe('SELECT bar');
      });
    });

    describe('take', () => {
      it('knows take', () => {
        const table = new Table('users');
        const manager = new SelectManager();
        manager.from(table).project(table.column('id'));
        manager.where(table.column('id').eq(1));
        manager.take(1);

        expect(manager.toSql()).toBe(
          `SELECT "users"."id" FROM "users" WHERE "users"."id" = 1 LIMIT 1`
        );
      });

      it('chains', () => {
        const manager = new SelectManager();
        expect(manager.take(1)).toBe(manager);
      });

      it('removes LIMIT when null is passed', () => {
        const manager = new SelectManager();
        manager.limit = 10;
        expect(manager.toSql()).toMatch(/LIMIT/);

        manager.limit = null;
        expect(manager.toSql()).not.toMatch(/LIMIT/);
      });
    });

    describe('where', () => {
      it('knows where', () => {
        const table = new Table('users');
        const manager = new SelectManager();
        manager.from(table).project(table.column('id'));
        manager.where(table.column('id').eq(1));
        expect(manager.toSql()).toBe(
          `SELECT "users"."id" FROM "users" WHERE "users"."id" = 1`
        );
      });

      it('chains', () => {
        const table = new Table('users');
        const manager = new SelectManager();
        manager.from(table);
        expect(
          manager.project(table.column('id')).where(table.column('id').eq(1))
        ).toBe(manager);
      });
    });

    describe('from', () => {
      it('makes sql', () => {
        const table = new Table('users');
        const manager = new SelectManager();

        manager.from(table);
        manager.project(table.column('id'));
        expect(manager.toSql()).toBe(`SELECT "users"."id" FROM "users"`);
      });

      it('chains', () => {
        const table = new Table('users');
        const manager = new SelectManager();
        expect(manager.from(table).project(table.column('id'))).toBe(manager);
        expect(manager.toSql()).toBe(`SELECT "users"."id" FROM "users"`);
      });
    });

    describe('source', () => {
      it('returns the join source of the select core', () => {
        const manager = new SelectManager();
        expect(manager.source).toBe(_.last(manager.ast.cores).source);
      });
    });

    describe('distinct', () => {
      it('sets the quantifier', () => {
        const manager = new SelectManager();

        manager.distinct();
        expect(_.last(manager.ast.cores).constructor).toBe(Distinct);

        manager.distinct(false);
        expect(_.last(manager.ast.cores).setQuantifier).toBeNull();
      });

      it('chains', () => {
        const manager = new SelectManager();
        expect(manager.distinct()).toBe(manager);
        expect(manager.distinct(false)).toBe(manager);
      });
    });

    describe('distinct_on', () => {
      it('sets the quantifier', () => {
        const manager = new SelectManager();
        const table = new Table('users');

        manager.distinctOn(table.column('id'));
        expect(_.last(manager.ast.cores).setQuantifier).toBe(
          new DistinctOn(table.column('id'))
        );

        manager.distinctOn(false);
        expect(_.last(manager.ast.cores).setQuantifier).toBeNull();
      });

      it('chains', () => {
        const manager = new SelectManager();
        const table = new Table('users');

        expect(manager.distinctOn(table.column('id'))).toBe(manager);
        expect(manager.distinctOn(false)).toBe(manager);
      });
    });
  });
});
