import Arel from '../../Arel';
import Table from '../../Table';
import SqlLiteral from '../SqlLiteral';

describe('As', () => {
  describe('#as', () => {
    it('makes an AS node', () => {
      const attr = new Table('users').column('id');
      const as = attr.as(Arel.sql('foo'));

      expect(as.left).toBe(attr);
      expect(as.right).toBe('foo');
    });

    it('converts right to SqlLiteral if a string', () => {
      const attr = new Table('users').column('id');
      const as = attr.as('foo');
      expect(as.right).toBeInstanceOf(SqlLiteral);
    });
  });

  describe('equality', () => {});
});
