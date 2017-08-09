import * as Arel from '../../Arel';

describe('Count', () => {
  describe('as', () => {
    it('should alias the count', () => {
      const table = new Arel.Table('users');
      expect(table.column('id').count().as('foo').toSql()).toBe(
        `COUNT("users"."id") AS foo`
      );
    });
  });

  describe('eq', () => {
    it('should compare the count', () => {
      const table = new Arel.Table('users');
      expect(table.column('id').count().eq(2).toSql()).toBe(
        `COUNT("users"."id") = 2`
      );
    });
  });

  // describe('equality', () => {});
});
