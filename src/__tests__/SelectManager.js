import _ from 'lodash';
import * as Arel from '../Arel';

const { Table, SelectManager } = Arel;
const {
  As,
  Distinct,
  SqlLiteral,
  Grouping,
  And,
  DistinctOn,
  OuterJoin,
  FullOuterJoin,
  RightOuterJoin
} = Arel.nodes;

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
        manager.project(Arel.star());
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

    describe('initialize', () => {
      it('uses alias in sql', () => {
        const table = new Table('users', { as: 'foo' });
        const mgr = table.from();
        mgr.skip(10);
        expect(mgr.toSql()).toBe(`SELECT FROM "users" "foo" OFFSET 10`);
      });
    });

    describe('skip', () => {
      it('should add an offset', () => {
        const table = new Table('users');
        const mgr = table.from();
        mgr.skip(10);
        expect(mgr.toSql()).toBe(`SELECT FROM "users" OFFSET 10`);
      });

      it('should chain', () => {
        const table = new Table('users');
        const mgr = table.from();
        expect(mgr.skip(10).toSql()).toBe(`SELECT FROM "users" OFFSET 10`);
      });
    });

    describe('offset', () => {
      it('should add an offset', () => {
        const table = new Table('users');
        const mgr = table.from();
        mgr.offset = 10;
        expect(mgr.toSql()).toBe(`SELECT FROM "users" OFFSET 10`);
      });

      it('should remove an offset', () => {
        const table = new Table('users');
        const mgr = table.from();
        mgr.offset = 10;
        expect(mgr.toSql()).toBe(`SELECT FROM "users" OFFSET 10`);

        mgr.offset = null;
        expect(mgr.toSql()).toBe(`SELECT FROM "users"`);
      });

      it('should return the offset', () => {
        const table = new Table('users');
        const mgr = table.from();
        mgr.offset = 10;
        expect(mgr.offset).toBe(10);
      });
    });

    describe('exists', () => {
      it('should create an exists clause', () => {
        const table = new Table('users');
        const manager = new SelectManager(table);
        manager.project(new SqlLiteral('*'));

        const m2 = new SelectManager();
        m2.project(manager.exists());
        expect(m2.toSql()).toBe(`SELECT EXISTS (${manager.toSql()})`);
      });

      it('can be aliased', () => {
        const table = new Table('users');
        const manager = new SelectManager();
        manager.project(new SqlLiteral('*'));
        const m2 = new SelectManager();
        m2.project(manager.exists().as('foo'));
        expect(m2.toSql()).toBe(`SELECT EXISTS (${manager.toSql()}) AS foo`);
      });
    });

    describe('union', () => {
      it('should union two managers', () => {
        const table = new Table('users');
        const m1 = new SelectManager(table);
        m1.project(Arel.star());
        m1.where(table.column('age').lt(18));

        const m2 = new SelectManager(table);
        m2.project(Arel.star());
        m2.where(table.column('age').gt(99));

        expect(m1.union(m2).toSql()).toBe(
          `( SELECT * FROM "users" WHERE "users"."age" < 18 UNION SELECT * FROM "users" WHERE "users"."age" > 99 )`
        );
      });

      it('should union all', () => {
        const table = new Table('users');
        const m1 = new SelectManager(table);
        m1.project(Arel.star());
        m1.where(table.column('age').lt(18));

        const m2 = new SelectManager(table);
        m2.project(Arel.star());
        m2.where(table.column('age').gt(99));

        expect(m1.union('all', m2).toSql()).toBe(
          `( SELECT * FROM "users" WHERE "users"."age" < 18 UNION ALL SELECT * FROM "users" WHERE "users"."age" > 99 )`
        );
      });
    });

    describe('intersect', () => {
      it('should intersect two managers', () => {
        const table = new Table('users');
        const m1 = new SelectManager(table);
        m1.project(Arel.star());
        m1.where(table.column('age').gt(18));

        const m2 = new SelectManager(table);
        m2.project(Arel.star());
        m2.where(table.column('age').lt(99));

        expect(m1.intersect(m2).toSql()).toBe(
          `( SELECT * FROM "users" WHERE "users"."age" > 18 INTERSECT SELECT * FROM "users" WHERE "users"."age" < 99 )`
        );
      });
    });

    describe('except', () => {
      it('should except two managers', () => {
        const table = new Table('users');
        const m1 = new SelectManager(table);
        m1.project(Arel.star());
        m1.where(table.column('age').between(18, 60));

        const m2 = new SelectManager(table);
        m2.project(Arel.star());
        m2.where(table.column('age').between(40, 99));

        expect(m1.except(m2).toSql()).toBe(
          `( SELECT * FROM "users" WHERE "users"."age" BETWEEN 18 AND 60 EXCEPT SELECT * FROM "users" WHERE "users"."age" BETWEEN 40 AND 99 )`
        );
      });
    });

    describe('with', () => {
      it('should support basic WITH', () => {
        const users = new Table('users');
        const usersTop = new Table('users_top');
        const comments = new Table('comments');
        const top = users
          .project(users.column('id'))
          .where(users.column('karma').gt(100));
        const usersAs = new As(usersTop, top);
        const selectManager = comments
          .project(Arel.star())
          .with(usersAs)
          .where(
            comments
              .column('author_id')
              .in(usersTop.project(usersTop.column('id')))
          );
        expect(selectManager.toSql()).toBe(
          `WITH "users_top" AS (SELECT "users"."id" FROM "users" WHERE "users"."karma" > 100) SELECT * FROM "comments" WHERE "comments"."author_id" IN (SELECT "users_top"."id" FROM "users_top")`
        );
      });

      it('should support WITH RECURSIVE', () => {
        const comments = new Table('comments');
        const commentsId = comments.column('id');
        const commentsParentId = comments.column('parent_id');
        const replies = new Table('replies');
        const repliesId = replies.column('id');

        const recursiveTerm = new SelectManager();
        recursiveTerm
          .from(comments)
          .project(commentsId, commentsParentId)
          .where(commentsId.eq(42));

        const nonRecursiveTerm = new SelectManager();
        nonRecursiveTerm
          .from(comments)
          .project(commentsId, commentsParentId)
          .join(replies)
          .on(commentsParentId.eq(repliesId));

        const union = recursiveTerm.union(nonRecursiveTerm);
        const asStatement = new As(replies, union);
        const manager = new SelectManager();
        manager
          .with('recursive', asStatement)
          .from(replies)
          .project(Arel.star());
        expect(manager.toSql()).toBe(
          `WITH RECURSIVE "replies" AS ( SELECT "comments"."id", "comments"."parent_id" FROM "comments" WHERE "comments"."id" = 42 UNION SELECT "comments"."id", "comments"."parent_id" FROM "comments" INNER JOIN "replies" ON "comments"."parent_id" = "replies"."id" ) SELECT * FROM "replies"`
        );
      });
    });

    describe('ast', () => {
      it('should return the ast', () => {
        const table = new Table('users');
        const mgr = table.from();
        expect(mgr.ast).not.toBeNull();
      });

      it('should allow orders to work when the ast is grepped', () => {
        const table = new Table('users');
        const mgr = table.from();
        mgr.project(Arel.sql('*'));
        mgr.from(table);
        mgr.order.push(new Ascending(Arel.sql('foo')));
        // mgr.ast.grep(OuterJoin);
        // expect(mgr.toSql()).toBe(`SELECT * FROM "users" ORDER BY foo ASC`)
      });
    });

    describe('taken', () => {
      it('should return limit', () => {
        const manager = new SelectManager();
        manager.take(10);
        expect(manager.taken).toBe(10);
      });
    });

    describe('lock', () => {
      it('adds a lock node', () => {
        const table = new Table('users');
        const mgr = table.from();
        expect(mgr.lock().toSql()).toBe(`SELECT FROM "users" FOR UPDATE`);
      });
    });

    describe('orders', () => {
      it('returns order clauses', () => {
        const table = new Table('users');
        const manager = new SelectManager();
        const order = table.column('id');
        manager.order(table.column('id'));
        expect(manager.orders).toEqual([order]);
      });
    });

    describe('order', () => {
      it('generates order clauses', () => {
        const table = new Table('users');
        const manager = new SelectManager();
        manager.project(new SqlLiteral('*'));
        manager.from(table);
        manager.order(table.column('id'));
        expect(manager.toSql()).toBe(
          `SELECT * FROM "users" ORDER BY "users"."id"`
        );
      });

      it('takes *args', () => {
        const table = new Table('users');
        const manager = new SelectManager();
        manager.project(new SqlLiteral('*'));
        manager.from(table);
        manager.order(table.column('id'), table.column('name'));
        expect(manager.toSql()).toBe(
          `SELECT * FROM "users" ORDER BY "users"."id", "users"."name"`
        );
      });

      it('chains', () => {
        const table = new Table('users');
        const manager = new SelectManager();
        expect(manager.order(table.column('id'))).toBe(manager);
      });

      it('has order attributes', () => {
        const table = new Table('users');
        const manager = new SelectManager();
        manager.project(new SqlLiteral('*'));
        manager.from(table);
        manager.order(table.column('id').desc());
        expect(manager.toSql()).toBe(
          `SELECT * FROM "users" ORDER BY "users"."id" DESC`
        );
      });
    });

    describe('on', () => {
      it('takes two params', () => {
        const left = new Table('users');
        const right = left.alias();
        const predicate = left.column('id').eq(right.column('id'));
        const manager = new SelectManager();

        manager.from(left);
        manager.join(right).on(predicate, predicate);
        expect(manager.toSql()).toBe(
          `SELECT FROM "users" INNER JOIN "users" "users_2" ON "users"."id" = "users_2"."id" AND "users"."id" = "users_2"."id"`
        );
      });

      it('takes three params', () => {
        const left = new Table('users');
        const right = left.alias;
        const predicate = left.column('id').eq(right.column('id'));
        const manager = new SelectManager();
        manager.from(left);
        manager
          .join(right)
          .on(
            predicate,
            predicate,
            left.column('name').eq(right.column('name'))
          );
        expect(manager.toSql()).toBe(
          `SELECT FROM "users" INNER JOIN "users" "users_2" ON "users"."id" = "users_2"."id" AND "users"."id" = "users_2"."id" AND "users"."name" = "users_2"."name"`
        );
      });
    });

    it('should hand back froms', () => {
      const relation = new SelectManager();
      expect(relation.froms()).toEqual([]);
    });

    it('should create and nodes', () => {
      const relation = new SelectManager();
      const children = ['foo', 'bar', 'baz'];
      const clause = relation.createAnd(children);
      expect(clause).toBeInstanceOf(And);
      expect(clause.children).toBe(children);
    });

    it('should create insert managers', () => {
      const relation = new SelectManager();
      const insert = relation.createInsert();
      expect(insert).toBeInstanceOf(InsertManager);
    });

    it('should create join nodes', () => {
      const relation = new SelectManager();
      const join = relation.createJoin('foo', 'bar');
      expect(join).toBeInstanceOf(InnerJoin);
      expect(join.left).toBe('foo');
      expect(join.right).toBe('bar');
    });

    it('should create join nodes with a full outer join klass', () => {
      const relation = new SelectManager();
      const join = relation.createJoin('foo', 'bar', FullOuterJoin);
      expect(join).toBeInstanceOf(FullOuterJoin);
      expect(join.left).toBe('foo');
      expect(join.right).toBe('bar');
    });

    it('should create join nodes with a outer join klass', () => {
      const relation = new SelectManager();
      const join = relation.createJoin('foo', 'bar', OuterJoin);
      expect(join).toBeInstanceOf(OuterJoin);
      expect(join.left).toBe('left');
      expect(join.right).toBe('right');
    });

    it('should create join nodes with a right outer join klass', () => {
      const relation = new SelectManager();
      const join = relation.createJoin('foo', 'bar', RightOuterJoin);
      expect(join).toBeInstanceOf(RightOuterJoin);
      expect(join.left).toBe('foo');
      expect(join.right).toBe('bar');
    });

    describe('join', () => {
      it('responds to join', () => {
        const left = new Table('users');
        const right = left.alias();
        const predicate = left.column('id').eq(right.column('id'));
        const manager = new SelectManager();

        manager.from(left);
        manager.join(right).on(predicate);
        expect(manager.toSql()).toBe(
          `SELECT FROM "users" INNER JOIN "users" "users_2" ON "users"."id" = "users_2"."id"`
        );
      });

      it('takes a class', () => {
        const left = new Table('users');
        const right = left.alias();
        const predicate = left.column('id').eq(right.column('id'));
        const manager = new SelectManager();

        manager.from(left);
        manager.join(right, OuterJoin).on(predicate);
        expect(manager.toSql()).toBe(
          `SELECT FROM "users" LEFT OUTER JOIN "users" "users_2" ON "users"."id" = "users_2"."id"`
        );
      });

      it('takes the full outer join class', () => {
        const left = new Table('users');
        const right = left.alias();
        const predicate = left.column('id').eq(right.column('id'));
        const manager = new SelectManager();
        manager.from(left);
        manager.join(right, FullOuterJoin).on(predicate);
        expect(manager.toSql()).toBe(
          `SELECT FROM "users" FULL OUTER JOIN "users" "users_2" ON "users"."id" = "users_2"."id"`
        );
      });

      it('takes the right outer join class', () => {
        const left = new Table('users');
        const right = left.alias();
        const predicate = left.column('id').eq(right.column('id'));
        const manager = new SelectManager();

        manager.from(left);
        manager.from(right, RightOuterJoin).on(predicate);
        expect(manager.toSql()).toBe(
          `SELECT FROM "users" RIGHT OUTER JOIN "users" "users_2" ON "users"."id" = "users_2"."id"`
        );
      });

      it('noops on null', () => {
        const manager = new SelectManager();
        expect(manager.join(null)).toBe(manager);
      });

      // it('raises EmptyJoinError on empty', () => {
      //   const left = new Table('users');
      //   const manager = new SelectManager();
      //   manager.from(left);
      //   expect()
      // })
    });

    describe('outer join', () => {
      it('responds to join', () => {
        const left = new Table('users');
        const right = left.alias();
        const predicate = left.column('id').eq(right.column('id'));
        const manager = new SelectManager();

        manager.from(left);
        manager.outerJoin(right).on(predicate);
        expect(manager.toSql()).toBe(
          `SELECT FROM "users" LEFT OUTER JOIN "users" "users_2" ON "users"."id" = "users_2"."id"`
        );
      });

      it('noops on null', () => {
        const manager = new SelectManager();
        expect(manager.outerJoin(null)).toBe(manager);
      });
    });

    describe('joins', () => {
      it('returns inner join sql', () => {
        const table = new Table('users');
        const aliaz = table.alias();
        const manager = new SelectManager();
        manager.from(
          new InnerJoin(aliaz, table.column('id').eq(aliaz.column('id')))
        );
        expect(manager.toSql()).toBe(
          `SELECT FROM "users" INNER JOIN "users" "users_2" ON "users"."id" = "users_2"."id"`
        );
      });

      it('returns outer join sql', () => {
        const table = new Table('users');
        const aliaz = table.alias();
        const manager = new SelectManager();
        manager.from(
          new OuterJoin(aliaz, table.column('id').eq(aliaz.column('id')))
        );
        expect(manager.toSql()).toBe(
          `SELECT FROM "users" LEFT OUTER JOIN "users" "users_2" ON "users"."id" = "users_2"."id"`
        );
      });

      it('can have a non-table alias as relation name', () => {});

      it('joins itself', () => {});

      it('returns string join sql', () => {});
    });

    describe('group', () => {});

    describe('window definition', () => {});

    describe('delete', () => {});

    describe('whereSql', () => {});

    describe('update', () => {});

    describe('project', () => {
      it('takes sql literals', () => {
        const manager = new SelectManager();
        manager.project(new SqlLiteral('*'));
        expect(manager.toSql()).toBe('SELECT *');
      });

      it('takes multiple args', () => {
        const manager = new SelectManager();
        manager.project(new SqlLiteral('foo'), new SqlLiteral('bar'));
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
        expect(_.last(manager.ast.cores).setQuantifier.constructor).toBe(
          Distinct
        );

        manager.distinct(false);
        expect(_.last(manager.ast.cores).setQuantifier).toBeNull();
      });

      it('chains', () => {
        const manager = new SelectManager();
        expect(manager.distinct()).toBe(manager);
        expect(manager.distinct(false)).toBe(manager);
      });
    });

    describe('distinctOn', () => {
      it('sets the quantifier', () => {
        const manager = new SelectManager();
        const table = new Table('users');

        manager.distinctOn(table.column('id'));
        expect(_.last(manager.ast.cores).setQuantifier.expr.name).toBe('id');

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
