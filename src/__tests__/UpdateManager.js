import { Base } from '../__fixtures__/FakeRecord';
import { Table } from '../';
import UpdateManager from '../UpdateManager';
import { BindParam, SqlLiteral, JoinSource } from '../nodes';

Table.engine = new Base();

describe('UpdateManager', () => {
  describe('new', () => {
    it('takes an engine', () => {
      new UpdateManager();
    });
  });

  it('should not quote sql literals', () => {
    const table = new Table('users');
    const um = new UpdateManager();
    um.table(table);
    um.set([[table.column('name'), new BindParam()]]);
    expect(um.toSql()).toBe('UPDATE "users" SET "name" = ?');
  });

  it('handles limit properly', () => {
    const table = new Table('users');
    const um = new UpdateManager();
    um.key = 'id';
    um.take(10);
    um.table(table);
    um.set([[table.column('name'), null]]);
    expect(um.toSql()).toMatch(/LIMIT 10/);
  });

  describe('set', () => {
    it('updates with null', () => {
      const table = new Table('users');
      const um = new UpdateManager();
      um.table(table);
      um.set([[table.column('name'), null]]);
      expect(um.toSql()).toBe('UPDATE "users" SET "name" = NULL');
    });

    it('takes a string', () => {
      const table = new Table('users');
      const um = new UpdateManager();
      um.table(table);
      um.set(new SqlLiteral('foo = bar'));
      expect(um.toSql()).toBe('UPDATE "users" SET foo = bar');
    });

    it('takes a list of lists', () => {
      const table = new Table('users');
      const um = new UpdateManager();
      um.table(table);
      um.set([[table.column('id'), 1], [table.column('name'), 'hello']]);
      expect(um.toSql()).toBe(`UPDATE "users" SET "id" = 1, "name" = 'hello'`);
    });

    it('chains', () => {
      const table = new Table('users');
      const um = new UpdateManager();
      um.set([[table.column('id'), 1], [table.column('name'), 'hello']]);
      expect(um).toEqual(um);
    });
  });

  describe('table', () => {
    it('generates an update statement', () => {
      const um = new UpdateManager();
      um.table(new Table('users'));
      expect(um.toSql()).toBe('UPDATE "users"');
    });

    it('chains', () => {
      const um = new UpdateManager();
      um.table(new Table('users'));
      expect(um).toEqual(um);
    });

    it('generates an update statement with joins', () => {
      const um = new UpdateManager();
      const table = new Table('users');

      const joinSource = new JoinSource(table, [
        table.createJoin(new Table('posts'))
      ]);

      um.table(joinSource);
      expect(um.toSql()).toBe('UPDATE "users" INNER JOIN "posts"');
    });
  });

  describe('where', () => {
    it('generates a where clause', () => {
      const table = new Table('users');
      const um = new UpdateManager();
      um.table(table);
      um.where(table.column('id').eq(1));
      expect(um.toSql()).toBe('UPDATE "users" WHERE "users"."id" = 1');
    });

    it('chains', () => {
      const table = new Table('users');
      const um = new UpdateManager();
      um.table(table);
      um.where(table.column('id').eq(1));

      expect(um).toEqual(um);
    });
  });

  describe('key', () => {
    it('can be set', () => {
      const table = new Table('users');
      const um = new UpdateManager();
      um.key = table.column('foo');

      expect(um.ast.key).toEqual(table.column('foo'));
    });

    it('can be accessed', () => {
      const table = new Table('users');
      const um = new UpdateManager();
      um.key = table.column('foo');

      expect(um.key).toEqual(table.column('foo'));
    });
  });
});
