import { Base } from '../__fixtures__/FakeRecord';
import InsertManager from '../InsertManager';
import TreeManager from '../TreeManager';
import Table from '../Table';
import {
  SqlLiteral,
  StringJoin,
  InnerJoin,
  FullOuterJoin,
  OuterJoin,
  RightOuterJoin
} from '../nodes';

let _relation = null;

beforeAll(() => {
  Table.engine = new Base();
});

beforeEach(() => {
  _relation = new Table('users');
});

describe('Table', () => {
  it('should create string join nodes', () => {
    const join = _relation.createStringJoin('foo');
    expect(join).toBeInstanceOf(StringJoin);
    expect(join.left).toBe('foo');
  });

  it('should create join nodes', () => {
    const join = _relation.createJoin('foo', 'bar');
    expect(join).toBeInstanceOf(InnerJoin);
    expect(join.left).toBe('foo');
    expect(join.right).toBe('bar');
  });

  it('should create join nodes with a klass', () => {
    const join = _relation.createJoin('foo', 'bar', FullOuterJoin);
    expect(join).toBeInstanceOf(FullOuterJoin);
    expect(join.left).toBe('foo');
    expect(join.right).toBe('bar');
  });

  it('should create join nodes with a klass', () => {
    const join = _relation.createJoin('foo', 'bar', OuterJoin);
    expect(join).toBeInstanceOf(OuterJoin);
    expect(join.left).toBe('foo');
    expect(join.right).toBe('bar');
  });

  it('should create join nodes with a klass', () => {
    const join = _relation.createJoin('foo', 'bar', RightOuterJoin);
    expect(join).toBeInstanceOf(RightOuterJoin);
    expect(join.left).toBe('foo');
    expect(join.right).toBe('bar');
  });

  it('should return an insert manager', () => {
    const im = _relation.compileInsert('VALUES(NULL)');
    expect(im).toBeInstanceOf(InsertManager);
    im.into(new Table('users'));
    expect(im.toSql()).toBe('INSERT INTO "users" VALUES(NULL)');
  });

  describe('skip', () => {
    it('should add an offset', () => {
      const sm = _relation.skip(2);
      expect(sm.toSql()).toBe('SELECT FROM "users" OFFSET 2');
    });
  });

  describe('having', () => {
    it('adds a having clause', () => {
      const mgr = _relation.having(_relation.column('id').eq(10));
      expect(mgr.toSql()).toBe('SELECT FROM "users" HAVING "users"."id" = 10');
    });
  });

  describe('group', () => {
    it('should create a group', () => {
      const manager = _relation.group(_relation.column('id'));
      expect(manager.toSql()).toBe('SELECT FROM "users" GROUP BY "users"."id"');
    });
  });

  describe('alias', () => {
    it('should create a node that proxies to a table', () => {
      const node = _relation.alias();
      expect(node.name).toBe('users_2');
      expect(node.column('id').relation).toBe(node);
    });
  });

  describe('new', () => {
    it('should accept a hash', () => {
      const rel = new Table('users', { as: 'foo' });
      expect(rel.tableAlias).toBe('foo');
    });

    it('ignores as if it equals name', () => {
      const rel = new Table('users', { as: 'users' });
      expect(rel.tableAlias).toBe(null);
    });
  });

  describe('order', () => {
    it('should take an order', () => {
      const manager = _relation.order('foo');
      expect(manager.toSql()).toBe('SELECT FROM "users" ORDER BY foo');
    });
  });

  describe('take', () => {
    it('should add a limit', () => {
      const manager = _relation.take(1);
      manager.project(new SqlLiteral('*'));
      expect(manager.toSql()).toBe('SELECT * FROM "users" LIMIT 1');
    });
  });

  describe('project', () => {
    it('can project', () => {
      const manager = _relation.project(new SqlLiteral('*'));
      expect(manager.toSql()).toBe('SELECT * FROM "users"');
    });

    it('can take multiple parameters', () => {
      const manager = _relation.project(
        new SqlLiteral('*'),
        new SqlLiteral('*')
      );
      expect(manager.toSql()).toBe('SELECT *, * FROM "users"');
    });
  });

  describe('where', () => {
    it('returns a tree manager', () => {
      const manager = _relation.where(_relation.column('id').eq(1));
      manager.project(_relation.column('id'));
      expect(manager).toBeInstanceOf(TreeManager);
      expect(manager.toSql()).toBe(
        'SELECT "users"."id" FROM "users" WHERE "users"."id" = 1'
      );
    });
  });

  it('should have a name', () => {
    expect(_relation.name).toBe('users');
  });

  it('should have a table name', () => {
    expect(_relation.tableName).toBe('users');
  });

  describe('column', () => {
    describe('when given a String', () => {
      it('manufactures an attribute if the symbol names an attribute within the _relation', () => {
        const column = _relation.column('id');
        expect(column.name).toBe('id');
      });
    });
  });

  // describe('equality', () => {
  //   it('is equal with equal ivars', () => {
  //     const relation1 = new Table('users');
  //     relation1.tableAlias = 'zomg';
  //     const relation2 = new Table('users');
  //     relation2.tableAlias = 'zomg';
  //     const array = [relation1, relation2];
  //     expect(_.uniq(array).length).toBe(1);
  //   });

  //   it('is not equal with different ivars', () => {
  //     const relation1 = new Table('users');
  //     relation1.tableAlias = 'zomg';
  //     const relation2 = new Table('users');
  //     relation2.tableAlias = 'zomg2';
  //     const array = [relation1, relation2];
  //     expect(_.uniq(array).length).toBe(1);
  //   });
  // });
});
