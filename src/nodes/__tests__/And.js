import _ from 'lodash';
import And from '../And';

describe('And', () => {
  describe('equality', () => {
    it('is equal with equal ivars', () => {
      const array = [new And(['foo', 'bar']), new And(['foo', 'bar'])];
      expect(_.uniqWith(array, (a, b) => a.eql(b)).length).toBe(1);
    });

    it('is not equal with different ivars', () => {
      const array = [new And(['foo', 'bar']), new And(['foo', 'baz'])];
      expect(_.uniqWith(array, (a, b) => a.eql(b)).length).toBe(2);
    });
  });
});
