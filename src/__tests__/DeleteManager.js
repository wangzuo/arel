import { Table } from '../Arel';
import DeleteManager from '../DeleteManager';

describe('delete manager', () => {
  describe('new', () => {
    it('takes an engine', () => {
      new DeleteManager();
    });
  });

  it('handles limit properly', () => {
    const table = new Table('users');
    const dm = new DeleteManager();
    dm.take(10);
    dm.from(table);
    expect(dm.toSql()).toMatch(/LIMIT 10/);
  });

  describe('from', () => {
    it('uses from', () => {
      const table = new Table('users');
      const dm = new DeleteManager();
      dm.from(table);
      expect(dm.toSql()).toBe(`DELETE FROM "users"`);
    });

    it('chains', () => {
      const table = new Table('users');
      const dm = new DeleteManager();
      expect(dm.from(table)).toBe(dm);
    });
  });

  describe('where', () => {
    it('uses where values', () => {
      const table = new Table('users');
      const dm = new DeleteManager();
      dm.from(table);
      dm.where(table.column('id').eq(10));
      expect(dm.toSql()).toBe('DELETE FROM "users" WHERE "users"."id" = 10');
    });

    it('chains', () => {
      const table = new Table('users');
      const dm = new DeleteManager();
      expect(dm.where(table.column('id').eq(10))).toBe(dm);
    });
  });
});
