import * as Arel from '../../Arel';
import Table from '../../Table';

describe('Attribute', () => {
  describe('#notEq', () => {
    it('should create a NotEqual node', () => {
      const relation = new Table('users');
      expect(relation.column('id').notEq(10)).toBeInstanceOf(
        Arel.nodes.NotEqual
      );
    });

    it('should generate != in sql', () => {
      const relation = new Table('users');
      const mgr = relation.project(relation.column('id'));
      mgr.where(relation.column('id').notEq(10));
      expect(mgr.toSql()).toBe(
        `SELECT "users"."id" FROM "users" WHERE "users"."id" != 10`
      );
    });

    it('should handle null', () => {
      const relation = new Table('users');
      const mgr = relation.project(relation.column('id'));
      mgr.where(relation.column('id').notEq(null));
      expect(mgr.toSql()).toBe(
        `SELECT "users"."id" FROM "users" WHERE "users"."id" IS NOT NULL`
      );
    });
  });

  describe('#notEqAny', () => {
    it('should create a Grouping node', () => {
      const relation = new Table('users');
      expect(relation.column('id').notEqAny([1, 2])).toBeInstanceOf(
        Arel.nodes.Grouping
      );
    });

    it('should generate ORs in sql', () => {
      const relation = new Table('users');
      const mgr = relation.project(relation.column('id'));
      mgr.where(relation.column('id').notEqAny([1, 2]));
      expect(mgr.toSql()).toBe(
        `SELECT "users"."id" FROM "users" WHERE ("users"."id" != 1 OR "users"."id" != 2)`
      );
    });
  });

  describe('#gt', () => {
    it('should create a GreaterThan node', () => {
      const relation = new Table('users');
      expect(relation.column('id').gt(10)).toBeInstanceOf(
        Arel.nodes.GreaterThan
      );
    });

    it('should generate > in sql', () => {
      const relation = new Table('users');
      const mgr = relation.project(relation.column('id'));
      mgr.where(relation.column('id').gt(10));
      expect(mgr.toSql()).toBe(
        `SELECT "users"."id" FROM "users" WHERE "users"."id" > 10`
      );
    });

    it('should handle comparing with a subquery', () => {
      const users = new Table('users');
      const avg = users.project(users.column('karma').average());
      const mgr = users
        .project(Arel.star())
        .where(users.column('karma').gt(avg));
      expect(mgr.toSql()).toBe(
        `SELECT * FROM "users" WHERE "users"."karma" > (SELECT AVG("users"."karma") FROM "users")`
      );
    });

    it('should accept various data types', () => {
      const relation = new Table('users');
      const mgr = relation.project(relation.column('id'));
      mgr.where(relation.column('name').gt('fake_name'));
      expect(mgr.toSql()).toBe(
        `SELECT "users"."id" FROM "users" WHERE "users"."name" > 'fake_name'`
      );

      // TODO
      const currentTime = new Date();
      mgr.where(relation.column('created_at').gt(currentTime));
      expect(mgr.toSql()).toBe(
        `SELECT "users"."id" FROM "users" WHERE "users"."name" > 'fake_name' AND "users"."created_at" > '${currentTime}'`
      );
    });
  });

  describe('#gtAny', () => {
    it('should create a Grouping node', () => {
      const relation = new Table('users');
      expect(relation.column('id').gtAny([1, 2])).toBeInstanceOf(
        Arel.nodes.Grouping
      );
    });

    it('should generate ORs in sql', () => {
      const relation = new Table('users');
      const mgr = relation.project(relation.column('id'));
      mgr.where(relation.column('id').gtAny([1, 2]));
      expect(mgr.toSql()).toBe(
        `SELECT "users"."id" FROM "users" WHERE ("users"."id" > 1 OR "users"."id" > 2)`
      );
    });
  });

  describe('#gtAll', () => {
    it('should create a Grouping node', () => {
      const relation = new Table('users');
      expect(relation.column('id').gtAll([1, 2])).toBeInstanceOf(
        Arel.nodes.Grouping
      );
    });

    it('should generate ANDs in sql', () => {
      const relation = new Table('users');
      const mgr = relation.project(relation.column('id'));
      mgr.where(relation.column('id').gtAll([1, 2]));
      expect(mgr.toSql()).toBe(
        `SELECT "users"."id" FROM "users" WHERE ("users"."id" > 1 AND "users"."id" > 2)`
      );
    });
  });

  describe('#gteq', () => {
    it('should create a GreaterThanOrEqual node', () => {
      const relation = new Table('users');
      expect(relation.column('id').gteq(10)).toBeInstanceOf(
        Arel.nodes.GreaterThanOrEqual
      );
    });

    it('should generate >= in sql', () => {
      const relation = new Table('users');
      const mgr = relation.project(relation.column('id'));
      mgr.where(relation.column('id').gteq(10));
      expect(mgr.toSql()).toBe(
        `SELECT "users"."id" FROM "users" WHERE "users"."id" >= 10`
      );
    });

    // TODO
    // it('should accept various data types', () => {
    //   const relation = new Table('users');
    //   const mgr = relation.project(relation.column('id'));
    //   mgr.where(relation.column('name')).gteq('fake_name');
    //   expect(mgr.toSql()).toBe(`"users"."name" >= 'fake_name'`);

    //   const currentTime = new Date();
    //   mgr.where(relation.column('created_at')).gteq(currentName);
    //   expect(mgr.toSql()).toBe(`"users"."created_at" >= '${currentTime}'`);
    // });
  });

  describe('#gteqAny', () => {
    it('should create a Grouping node', () => {
      const relation = new Table('users');
      expect(relation.column('id').gteqAny([1, 2])).toBeInstanceOf(
        Arel.nodes.Grouping
      );
    });

    it('should generate ORs in sql', () => {
      const relation = new Table('users');
      const mgr = relation.project(relation.column('id'));
      mgr.where(relation.column('id').gteqAny([1, 2]));
      expect(mgr.toSql()).toBe(
        `SELECT "users"."id" FROM "users" WHERE ("users"."id" >= 1 OR "users"."id" >= 2)`
      );
    });
  });

  describe('#gteqAll', () => {
    it('should create a Grouping node', () => {
      const relation = new Table('users');
      expect(relation.column('id').gteqAll([1, 2])).toBeInstanceOf(
        Arel.nodes.Grouping
      );
    });

    it('should generate ANDs in sql', () => {
      const relation = new Table('users');
      const mgr = relation.project(relation.column('id'));
      mgr.where(relation.column('id').gteqAll([1, 2]));
      expect(mgr.toSql()).toBe(
        `SELECT "users"."id" FROM "users" WHERE ("users"."id" >= 1 AND "users"."id" >= 2)`
      );
    });
  });

  describe('#lt', () => {
    it('should create a LessThan node', () => {
      const relation = new Table('users');
      expect(relation.column('id').lt(10)).toBeInstanceOf(Arel.nodes.LessThan);
    });

    it('should generate < in sql', () => {
      const relation = new Table('users');
      const mgr = relation.project(relation.column('id'));
      mgr.where(relation.column('id').lt(10));
      expect(mgr.toSql()).toBe(
        `SELECT "users"."id" FROM "users" WHERE "users"."id" < 10`
      );
    });

    // TODO
    // it('should accept various data types', () => {
    //   const relation = new Table('users');
    //   const mgr = relation.project(relation.column('id'));
    //   mgr.where(relation.column('name').lt('fake_name'));
    //   expect(mgr.toSql()).toBe(
    //     `SELECT "users"."id" FROM "users" WHERE "users"."name" < 'fake_name'`
    //   );

    //   const currentTime = new Date();
    //   mgr.where(relation.column('created_at')).lt(currentName);
    //   expect(mgr.toSql()).toBe(`"users"."created_at" < '${currentTime}'`);
    // });
  });

  describe('#ltAny', () => {
    it('should create a Grouping node', () => {
      const relation = new Table('users');
      expect(relation.column('id').ltAny([1, 2])).toBeInstanceOf(
        Arel.nodes.Grouping
      );
    });

    it('should generate ORs in sql', () => {
      const relation = new Table('users');
      const mgr = relation.project(relation.column('id'));
      mgr.where(relation.column('id').ltAny([1, 2]));
      expect(mgr.toSql()).toBe(
        `SELECT "users"."id" FROM "users" WHERE ("users"."id" < 1 OR "users"."id" < 2)`
      );
    });
  });

  describe('ltAll', () => {
    it('should create a Grouping node', () => {
      const relation = new Table('users');
      expect(relation.column('id').ltAll([1, 2])).toBeInstanceOf(
        Arel.nodes.Grouping
      );
    });

    it('should generate ANDs in sql', () => {
      const relation = new Table('users');
      const mgr = relation.project(relation.column('id'));
      mgr.where(relation.column('id').ltAll([1, 2]));
      expect(mgr.toSql()).toBe(
        `SELECT "users"."id" FROM "users" WHERE ("users"."id" < 1 AND "users"."id" < 2)`
      );
    });
  });

  describe('#lteq', () => {
    it('should create a LessThanOrEqual node', () => {
      const relation = new Table('users');
      expect(relation.column('id').lteq([1, 2])).toBeInstanceOf(
        Arel.nodes.LessThanOrEqual
      );
    });

    it('should generate <= in sql', () => {
      const relation = new Table('users');
      const mgr = relation.project(relation.column('id'));
      mgr.where(relation.column('id').lteq(10));
      expect(mgr.toSql()).toBe(
        `SELECT "users"."id" FROM "users" WHERE "users"."id" <= 10`
      );
    });

    // TODO
    // it('should accept various data types', () => {
    //   const relation = new Table('users');
    //   const mgr = relation.project(relation.column('id'));
    //   mgr.where(relation.column('name').lteq('fake_name'));
    //   expect(mgr.toSql()).toBe(`"users"."name" <= 'fake_name'`);

    //   const currentTime = new Date();
    //   mgr.where(relation.column('created_at')).lteq(currentName);
    //   expect(mgr.toSql()).toBe(`"users"."created_at" <= '${currentTime}'`);
    // });
  });

  describe('#lteqAny', () => {
    it('should create a Grouping node', () => {
      const relation = new Table('users');
      expect(relation.column('id').lteqAny([1, 2])).toBeInstanceOf(
        Arel.nodes.Grouping
      );
    });

    it('should generate ORs in sql', () => {
      const relation = new Table('users');
      const mgr = relation.project(relation.column('id'));
      mgr.where(relation.column('id').lteqAny([1, 2]));
      expect(mgr.toSql()).toBe(
        `SELECT "users"."id" FROM "users" WHERE ("users"."id" <= 1 OR "users"."id" <= 2)`
      );
    });
  });

  describe('#lteqAll', () => {
    it('should create a Grouping node', () => {
      const relation = new Table('users');
      expect(relation.column('id').lteqAll([1, 2])).toBeInstanceOf(
        Arel.nodes.Grouping
      );
    });

    it('should generate ANDs in sql', () => {
      const relation = new Table('users');
      const mgr = relation.project(relation.column('id'));
      mgr.where(relation.column('id').lteqAll([1, 2]));
      expect(mgr.toSql()).toBe(
        `SELECT "users"."id" FROM "users" WHERE ("users"."id" <= 1 AND "users"."id" <= 2)`
      );
    });
  });

  describe('#average', () => {
    it('should create a Avg node', () => {
      const relation = new Table('users');
      expect(relation.column('id').average()).toBeInstanceOf(Arel.nodes.Avg);
    });

    it('should generate the proper SQL', () => {
      const relation = new Table('users');
      const mgr = relation.project(relation.column('id').average());
      expect(mgr.toSql()).toBe(`SELECT AVG("users"."id") FROM "users"`);
    });
  });

  describe('#maximum', () => {
    it('should create a Max node', () => {
      const relation = new Table('users');
      expect(relation.column('id').maximum()).toBeInstanceOf(Arel.nodes.Max);
    });

    it('should generate the proper SQL', () => {
      const relation = new Table('users');
      const mgr = relation.project(relation.column('id').maximum());
      expect(mgr.toSql()).toBe(`SELECT MAX("users"."id") FROM "users"`);
    });
  });

  describe('#minimum', () => {
    it('should create a Min node', () => {
      const relation = new Table('users');
      expect(relation.column('id').minimum()).toBeInstanceOf(Arel.nodes.Min);
    });

    it('should generate the proper SQL', () => {
      const relation = new Table('users');
      const mgr = relation.project(relation.column('id').minimum());
      expect(mgr.toSql()).toBe(`SELECT MIN("users"."id") FROM "users"`);
    });
  });

  describe('#sum', () => {
    it('should create a Sum node', () => {
      const relation = new Table('users');
      expect(relation.column('id').sum()).toBeInstanceOf(Arel.nodes.Sum);
    });

    it('should generate the proper SQL', () => {
      const relation = new Table('users');
      const mgr = relation.project(relation.column('id').sum());
      expect(mgr.toSql()).toBe(`SELECT SUM("users"."id") FROM "users"`);
    });
  });

  describe('#count', () => {
    it('should return a Count node', () => {
      const relation = new Table('users');
      expect(relation.column('id').count()).toBeInstanceOf(Arel.nodes.Count);
    });

    it('should take a distinct param', () => {
      const relation = new Table('users');
      const count = relation.column('id').count(null);
      expect(count).toBeInstanceOf(Arel.nodes.Count);
      expect(count.distinct).toBeNull();
    });
  });

  describe('#eq', () => {
    it('should return an Equality node', () => {
      const attribute = new Arel.attributes.Attribute(null, null);
      const equality = attribute.eq(1);
      expect(equality.left).toBe(attribute);
      expect(equality.right.val).toBe(1);
      expect(equality).toBeInstanceOf(Arel.nodes.Equality);
    });

    it('should generate = in sql', () => {
      const relation = new Table('users');
      const mgr = relation.project(relation.column('id'));
      mgr.where(relation.column('id').eq(10));
      expect(mgr.toSql()).toBe(
        `SELECT "users"."id" FROM "users" WHERE "users"."id" = 10`
      );
    });

    it('should handle nil', () => {
      const relation = new Table('users');
      const mgr = relation.project(relation.column('id'));
      mgr.where(relation.column('id').eq(null));
      expect(mgr.toSql()).toBe(
        `SELECT "users"."id" FROM "users" WHERE "users"."id" IS NULL`
      );
    });
  });

  describe('#eqAny', () => {
    it('should create a Grouping node', () => {
      const relation = new Table('users');
      expect(relation.column('id').eqAny([1, 2])).toBeInstanceOf(
        Arel.nodes.Grouping
      );
    });

    it('should generate ORs in sql', () => {
      const relation = new Table('users');
      const mgr = relation.project(relation.column('id'));
      mgr.where(relation.column('id').eqAny([1, 2]));
      expect(mgr.toSql()).toBe(
        `SELECT "users"."id" FROM "users" WHERE ("users"."id" = 1 OR "users"."id" = 2)`
      );
    });

    it('should not eat input', () => {
      const relation = new Table('users');
      const mgr = relation.project(relation.column('id'));
      const values = [1, 2];
      mgr.where(relation.column('id').eqAny(values));
      expect(values).toEqual([1, 2]);
    });
  });

  describe('#eqAll', () => {
    it('should create a Grouping node', () => {
      const relation = new Table('users');
      expect(relation.column('id').eqAll([1, 2])).toBeInstanceOf(
        Arel.nodes.Grouping
      );
    });

    it('should generate ANDs in sql', () => {
      const relation = new Table('users');
      const mgr = relation.project(relation.column('id'));
      mgr.where(relation.column('id').eqAll([1, 2]));
      expect(mgr.toSql()).toBe(
        `SELECT "users"."id" FROM "users" WHERE ("users"."id" = 1 AND "users"."id" = 2)`
      );
    });

    it('should not eat input', () => {
      const relation = new Table('users');
      const mgr = relation.project(relation.column('id'));
      const values = [1, 2];
      mgr.where(relation.column('id').eqAll(values));
      expect(values).toEqual([1, 2]);
    });
  });

  describe('#matches', () => {
    it('should create a Matches node', () => {
      const relation = new Table('users');
      expect(relation.column('name').matches('%bacon%')).toBeInstanceOf(
        Arel.nodes.Matches
      );
    });

    it('should generate LIKE in sql', () => {
      const relation = new Table('users');
      const mgr = relation.project(relation.column('id'));
      mgr.where(relation.column('name').matches('%bacon%'));
      expect(mgr.toSql()).toBe(
        `SELECT "users"."id" FROM "users" WHERE "users"."name" LIKE '%bacon%'`
      );
    });
  });

  describe('#matchesAny', () => {
    it('should create a Grouping node', () => {
      const relation = new Table('users');
      expect(
        relation.column('name').matchesAny(['%chunky%', '%bacon%'])
      ).toBeInstanceOf(Arel.nodes.Grouping);
    });

    it('should generate ORs in sql', () => {
      const relation = new Table('users');
      const mgr = relation.project(relation.column('id'));
      mgr.where(relation.column('name').matchesAny(['%chunky%', '%bacon%']));
      expect(mgr.toSql()).toBe(
        `SELECT "users"."id" FROM "users" WHERE ("users"."name" LIKE '%chunky%' OR "users"."name" LIKE '%bacon%')`
      );
    });
  });

  describe('#matchesAll', () => {
    it('should create a Grouping node', () => {
      const relation = new Table('users');
      expect(
        relation.column('name').matchesAll(['%chunky%', '%bacon%'])
      ).toBeInstanceOf(Arel.nodes.Grouping);
    });

    it('should generate ANDs in sql', () => {
      const relation = new Table('users');
      const mgr = relation.project(relation.column('id'));
      mgr.where(relation.column('name').matchesAll(['%chunky%', '%bacon%']));
      expect(mgr.toSql()).toBe(
        `SELECT "users"."id" FROM "users" WHERE ("users"."name" LIKE '%chunky%' AND "users"."name" LIKE '%bacon%')`
      );
    });
  });

  describe('#doesNotMatch', () => {
    it('should create a DoesNotMatch node', () => {
      const relation = new Table('users');
      expect(relation.column('name').doesNotMatch('%bacon%')).toBeInstanceOf(
        Arel.nodes.DoesNotMatch
      );
    });

    it('should generate NOT LIKE in sql', () => {
      const relation = new Table('users');
      const mgr = relation.project(relation.column('id'));
      mgr.where(relation.column('name').doesNotMatch('%bacon%'));
      expect(mgr.toSql()).toBe(
        `SELECT "users"."id" FROM "users" WHERE "users"."name" NOT LIKE '%bacon%'`
      );
    });
  });

  describe('#doesNotMatchAny', () => {
    it('should create a Grouping node', () => {
      const relation = new Table('users');
      expect(
        relation.column('name').doesNotMatchAny(['%chunky%', '%bacon%'])
      ).toBeInstanceOf(Arel.nodes.Grouping);
    });

    it('should generate ORs in sql', () => {
      const relation = new Table('users');
      const mgr = relation.project(relation.column('id'));
      mgr.where(
        relation.column('name').doesNotMatchAny(['%chunky%', '%bacon%'])
      );
      expect(mgr.toSql()).toBe(
        `SELECT "users"."id" FROM "users" WHERE ("users"."name" NOT LIKE '%chunky%' OR "users"."name" NOT LIKE '%bacon%')`
      );
    });
  });

  describe('#doesNotMatchAll', () => {
    it('should create a Grouping node', () => {
      const relation = new Table('users');
      expect(
        relation.column('name').doesNotMatchAll(['%chunky%', '%bacon%'])
      ).toBeInstanceOf(Arel.nodes.Grouping);
    });

    it('should generate ANDs in sql', () => {
      const relation = new Table('users');
      const mgr = relation.project(relation.column('id'));
      mgr.where(
        relation.column('name').doesNotMatchAll(['%chunky%', '%bacon%'])
      );
      expect(mgr.toSql()).toBe(
        `SELECT "users"."id" FROM "users" WHERE ("users"."name" NOT LIKE '%chunky%' AND "users"."name" NOT LIKE '%bacon%')`
      );
    });
  });

  describe('with a range', () => {});

  describe('#in', () => {
    // it('can be constructed with a subquery', () => {
    //   const relation = new Table('users');
    //   const mgr = relation.project(relation.column('id'));
    //   mgr.where(
    //     relation.column('name').doesNotMatchAll(['%chunky%', '%bacon%'])
    //   );
    //   const attribute = Arel.attributes.Attribute(null, null);
    //   const node = attribute.in(mgr);
    //   expect(node).toEqual(new Arel.nodes.In(attribute, mgr.ast))
    // });
    // it('can be constructed with a list', () => {
    //   const attribute = Arel.attributes.Attribute(null, null);
    //   const node = attribute.in([1, 2, 3]);
    //   expect(node).toEqual(
    //     new Arel.nodes.In(attribute, [
    //       new Arel.nodes.Casted(1, attribute),
    //       new Arel.nodes.Casted(2, attribute),
    //       new Arel.nodes.Casted(3, attribute)
    //     ])
    //   );
    // });

    it('can be constructed with a random object', () => {});

    it('should generate IN in sql', () => {
      const relation = new Table('users');
      const mgr = relation.project(relation.column('id'));
      mgr.where(relation.column('id').in([1, 2, 3]));
      expect(mgr.toSql()).toBe(
        `SELECT "users"."id" FROM "users" WHERE "users"."id" IN (1, 2, 3)`
      );
    });
  });

  describe('#inAny', () => {
    it('should create a Grouping node', () => {
      const relation = new Table('users');
      expect(relation.column('id').inAny([1, 2])).toBeInstanceOf(
        Arel.nodes.Grouping
      );
    });

    it('should generate ORs in sql', () => {
      const relation = new Table('users');
      const mgr = relation.project(relation.column('id'));
      mgr.where(relation.column('id').inAny([[1, 2], [3, 4]]));
      expect(mgr.toSql()).toBe(
        `SELECT "users"."id" FROM "users" WHERE ("users"."id" IN (1, 2) OR "users"."id" IN (3, 4))`
      );
    });
  });

  describe('#inAll', () => {
    it('should create a Grouping node', () => {
      const relation = new Table('users');
      expect(relation.column('id').inAll([1, 2])).toBeInstanceOf(
        Arel.nodes.Grouping
      );
    });

    it('should generate ANDs in sql', () => {
      const relation = new Table('users');
      const mgr = relation.project(relation.column('id'));
      mgr.where(relation.column('id').inAll([[1, 2], [3, 4]]));
      expect(mgr.toSql()).toBe(
        `SELECT "users"."id" FROM "users" WHERE ("users"."id" IN (1, 2) AND "users"."id" IN (3, 4))`
      );
    });
  });

  describe('with a range', () => {});

  describe('#notIn', () => {
    it('can be constructed with a subquery', () => {});
    it('can be constructed with a Union', () => {});
    it('can be constructed with a list', () => {});
    it('can be constructed with a random object', () => {});

    it('should generate NOT IN in sql', () => {
      const relation = new Table('users');
      const mgr = relation.project(relation.column('id'));
      mgr.where(relation.column('id').notIn([1, 2, 3]));
      expect(mgr.toSql()).toBe(
        `SELECT "users"."id" FROM "users" WHERE "users"."id" NOT IN (1, 2, 3)`
      );
    });
  });

  describe('#notInAny', () => {
    it('should create a Grouping node', () => {
      const relation = new Table('users');
      expect(relation.column('id').notInAny([1, 2])).toBeInstanceOf(
        Arel.nodes.Grouping
      );
    });

    it('should generate ORs in sql', () => {
      const relation = new Table('users');
      const mgr = relation.project(relation.column('id'));
      mgr.where(relation.column('id').notInAny([[1, 2], [3, 4]]));
      expect(mgr.toSql()).toBe(
        `SELECT "users"."id" FROM "users" WHERE ("users"."id" NOT IN (1, 2) OR "users"."id" NOT IN (3, 4))`
      );
    });
  });

  describe('#notInAll', () => {
    it('should create a Grouping node', () => {
      const relation = new Table('users');
      expect(relation.column('id').notInAll([1, 2])).toBeInstanceOf(
        Arel.nodes.Grouping
      );
    });

    it('should generate ANDs in sql', () => {
      const relation = new Table('users');
      const mgr = relation.project(relation.column('id'));
      mgr.where(relation.column('id').notInAll([[1, 2], [3, 4]]));
      expect(mgr.toSql()).toBe(
        `SELECT "users"."id" FROM "users" WHERE ("users"."id" NOT IN (1, 2) AND "users"."id" NOT IN (3, 4))`
      );
    });
  });

  describe('#asc', () => {
    it('should create an Ascending node', () => {
      const relation = new Table('users');
      expect(relation.column('id').asc()).toBeInstanceOf(Arel.nodes.Ascending);
    });

    it('should generate ASC in sql', () => {
      const relation = new Table('users');
      const mgr = relation.project(relation.column('id'));
      mgr.order(relation.column('id').asc());
      expect(mgr.toSql()).toBe(
        `SELECT "users"."id" FROM "users" ORDER BY "users"."id" ASC`
      );
    });
  });

  describe('#desc', () => {
    it('should create an Descending node', () => {
      const relation = new Table('users');
      expect(relation.column('id').desc()).toBeInstanceOf(
        Arel.nodes.Descending
      );
    });

    it('should generate DESC in sql', () => {
      const relation = new Table('users');
      const mgr = relation.project(relation.column('id'));
      mgr.order(relation.column('id').desc());
      expect(mgr.toSql()).toBe(
        `SELECT "users"."id" FROM "users" ORDER BY "users"."id" DESC`
      );
    });
  });
});

describe('equality', () => {
  describe('#toSql', () => {
    it('should produce sql', () => {
      const table = new Table('users');
      expect(table.column('id').eq(1).toSql()).toBe(`"users"."id" = 1`);
    });
  });
});

describe('type casting', () => {
  // it('does not type cast by default', () => {});
  // it('type casts when given an explicit caster', () => {});
});
