import * as Arel from '../../Arel';

describe('Over', () => {
  describe('as', () => {
    it('should alias the expression', () => {
      const table = new Arel.Table('users');
      expect(table.column('id').count().over().as('foo').toSql()).toBe(
        `COUNT("users"."id") OVER () AS foo`
      );
    });
  });

  describe('with literal', () => {
    it('should reference the window definition by name', () => {
      const table = new Arel.Table('users');
      expect(table.column('id').count().over('foo').toSql()).toBe(
        `COUNT("users"."id") OVER "foo"`
      );
    });
  });

  describe('with SQL literal', () => {
    it('should reference the window definition by name', () => {
      const table = new Arel.Table('users');
      expect(table.column('id').count().over(Arel.sql('foo')).toSql()).toBe(
        `COUNT("users"."id") OVER foo`
      );
    });
  });

  describe('with no expression', () => {
    it('should use empty definition', () => {
      const table = new Arel.Table('users');
      expect(table.column('id').count().over().toSql()).toBe(
        `COUNT("users"."id") OVER ()`
      );
    });
  });

  describe('with expression', () => {
    it('should use definition in sub-expression', () => {
      const table = new Arel.Table('users');
      const win = new Arel.nodes.Window().order(table.column('foo'));
      expect(table.column('id').count().over(win).toSql()).toBe(
        `COUNT("users"."id") OVER (ORDER BY "users"."foo")`
      );
    });
  });

  // describe('equality', () => {});
});
