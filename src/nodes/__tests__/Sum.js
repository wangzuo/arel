import _ from 'lodash';
import * as Arel from '../../Arel';
import { Sum } from '../../nodes';

describe('Sum', () => {
  describe('as', () => {
    it('should alias the sum', () => {
      const table = new Arel.Table('users');
      expect(table.column('id').sum().as('foo').toSql()).toBe(
        `SUM("users"."id") AS foo`
      );
    });
  });

  // todo
  // describe('equality', () => {
  //   it('is equal with equal ivars', () => {
  //     const array = [new Sum('foo'), new Sum('foo')];
  //     expect(_.uniq(array).length).toBe(1);
  //   });

  //   it('is not equal with different ivars', () => {
  //     const array = [new Sum('foo'), new Sum('foo!')];
  //     expect(_.uniq(array).length).toBe(2);
  //   });
  // });

  describe('order', () => {
    it('should order the sum', () => {
      const table = new Arel.Table('users');
      expect(table.column('id').sum().desc().toSql()).toBe(
        `SUM("users"."id") DESC`
      );
    });
  });
});
