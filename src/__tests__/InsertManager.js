import { Base } from '../__fixtures__/FakeRecord';
import * as Arel from '../Arel';
import InsertManager from '../InsertManager';
import SelectManager from '../SelectManager';
import { Values } from '../nodes';

const { Table } = Arel;
Table.engine = new Base();

describe('insert manager', () => {
  describe('new', () => {
    it('takes an engine', () => {
      new InsertManager();
    });
  });

  describe('insert', () => {
    it('can create a Values node', () => {
      const manager = new InsertManager();
      const values = manager.createValues(['a', 'b'], ['c', 'd']);

      expect(values).toBeInstanceOf(Values);
      expect(values.left).toEqual(['a', 'b']);
      expect(values.right).toEqual(['c', 'd']);
    });

    it('allows sql literals', () => {
      const manager = new InsertManager();
      manager.into(new Table('users'));
      manager.values = manager.createValues([Arel.sql('*')], 'a');
      expect(manager.toSql()).toBe('INSERT INTO "users" VALUES (*)');
    });

    it('works with multiple values', () => {
      const table = new Table('users');
      const manager = new InsertManager();
      manager.into(table);
      manager.columns.push(table.column('id'));
      manager.columns.push(table.column('name'));
      manager.values = manager.createValuesList([
        ['1', 'david'],
        ['2', 'kir'],
        ['3', Arel.sql('DEFAULT')]
      ]);
      expect(manager.toSql()).toBe(
        `INSERT INTO "users" ("id", "name") VALUES ('1', 'david'), ('2', 'kir'), ('3', DEFAULT)`
      );
    });

    it('literals in multiple values are not escaped', () => {
      const table = new Table('users');
      const manager = new InsertManager();
      manager.into(table);
      manager.columns.push(table.column('name'));
      manager.values = manager.createValuesList([
        [Arel.sql('*')],
        [Arel.sql('DEFAULT')]
      ]);
      expect(manager.toSql()).toBe(
        'INSERT INTO "users" ("name") VALUES (*), (DEFAULT)'
      );
    });

    it('works with multiple single values', () => {
      const table = new Table('users');
      const manager = new InsertManager();
      manager.into(table);
      manager.columns.push(table.column('name'));
      manager.values = manager.createValuesList([
        ['david'],
        ['kir'],
        [Arel.sql('DEFAULT')]
      ]);
      expect(manager.toSql()).toBe(
        `INSERT INTO "users" ("name") VALUES ('david'), ('kir'), (DEFAULT)`
      );
    });

    it('inserts false', () => {
      const table = new Table('users');
      const manager = new InsertManager();
      manager.insert([[table.column('bool'), false]]);
      expect(manager.toSql()).toBe(`INSERT INTO "users" ("bool") VALUES ('f')`);
    });

    it('inserts null', () => {
      const table = new Table('users');
      const manager = new InsertManager();
      manager.insert([[table.column('id'), null]]);
      expect(manager.toSql()).toBe('INSERT INTO "users" ("id") VALUES (NULL)');
    });

    it('inserts time', () => {
      const table = new Table('users');
      const manager = new InsertManager();
      const time = new Date();
      const attribute = table.column('created_at');
      manager.insert([[attribute, time]]);
      expect(manager.toSql()).toBe(
        `INSERT INTO "users" ("created_at") VALUES (${Table.engine.connection.quote(
          time
        )})`
      );
    });

    it('takes a list of lists', () => {
      const table = new Table('users');
      const manager = new InsertManager();
      manager.into(table);
      manager.insert([
        [table.column('id'), 1],
        [table.column('name'), 'aaron']
      ]);
      expect(manager.toSql()).toBe(
        `INSERT INTO "users" ("id", "name") VALUES (1, 'aaron')`
      );
    });

    it('defaults the table', () => {
      const table = new Table('users');
      const manager = new InsertManager();
      manager.insert([
        [table.column('id'), 1],
        [table.column('name'), 'aaron']
      ]);
      expect(manager.toSql()).toBe(
        `INSERT INTO "users" ("id", "name") VALUES (1, 'aaron')`
      );
    });

    it('noop for empty list', () => {
      const table = new Table('users');
      const manager = new InsertManager();
      manager.insert([[table.column('id'), 1]]);
      manager.insert([]);
      expect(manager.toSql()).toBe(`INSERT INTO "users" ("id") VALUES (1)`);
    });

    it('is chainable', () => {
      const table = new Table('users');
      const manager = new InsertManager();
      const insertResult = manager.insert([[table.column('id'), 1]]);
      expect(insertResult).toBe(manager);
    });

    describe('into', () => {
      it('takes a Table and chains', () => {
        const manager = new InsertManager();
        expect(manager.into(new Table('users'))).toBe(manager);
      });

      it('converts to sql', () => {
        const table = new Table('users');
        const manager = new InsertManager();
        manager.into(table);
        expect(manager.toSql()).toBe(`INSERT INTO "users"`);
      });
    });

    describe('columns', () => {
      it('converts to sql', () => {
        const table = new Table('users');
        const manager = new InsertManager();
        manager.into(table);
        manager.columns.push(table.column('id'));
        expect(manager.toSql()).toBe(`INSERT INTO "users" ("id")`);
      });
    });

    describe('values', () => {
      it('converts to sql', () => {
        const table = new Table('users');
        const manager = new InsertManager();
        manager.into(table);
        manager.values = new Values([1]);
        expect(manager.toSql()).toBe(`INSERT INTO "users" VALUES (1)`);
      });

      it('accepts sql literals', () => {
        const table = new Table('users');
        const manager = new InsertManager();
        manager.into(table);
        manager.values = Arel.sql('DEFAULT VALUES');
        expect(manager.toSql()).toBe('INSERT INTO "users" DEFAULT VALUES');
      });
    });

    describe('combo', () => {
      it('combines columns and values list in order', () => {
        const table = new Table('users');
        const manager = new InsertManager();
        manager.into(table);
        manager.values = new Values([1, 'aaron']);
        manager.columns.push(table.column('id'));
        manager.columns.push(table.column('name'));
        expect(manager.toSql()).toBe(
          `INSERT INTO "users" ("id", "name") VALUES (1, 'aaron')`
        );
      });
    });

    describe('select', () => {
      it('accepts a select query in place of a VALUES clause', () => {
        const table = new Table('users');
        const manager = new InsertManager();
        manager.into(table);
        const select = new SelectManager();
        select.project(Arel.sql('1'));
        select.project(Arel.sql('"aaron'));

        manager.select(select);
        manager.columns.push(table.column('id'));
        manager.columns.push(table.column('name'));
        expect(manager.toSql()).toBe(
          `INSERT INTO "users" ("id", "name") (SELECT 1, "aaron")`
        );
      });
    });
  });
});
