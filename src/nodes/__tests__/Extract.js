import * as Arel from '../../Arel';
import Extract from '../Extract';

describe('Extract', () => {
  it('should extract field', () => {
    const table = new Arel.Table('users');
    expect(table.column('timestamp').extract('date').toSql()).toBe(
      `EXTRACT(DATE FROM "users"."timestamp")`
    );
  });

  describe('as', () => {
    it('should alias the extract', () => {
      const table = new Arel.Table('users');
      expect(table.column('timestamp').extract('date').as('foo').toSql()).toBe(
        `EXTRACT(DATE FROM "users"."timestamp") AS foo`
      );
    });

    // todo
    // it('should not mutate the extract', () => {
    //   const table = new Arel.Table('users');
    //   const extract = table.column('timestamp').extract('date');
    //   before = extract;
    //   extract.as('foo');
    //   expect(before).toBe(extract);
    // });
  });

  // todo
  // describe('equality', () => {
  //   it('is equal with equal ivars', () => {});
  //   it('is not equal with different ivars', () => {});
  // });
});
