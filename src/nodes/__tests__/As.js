import * as Arel from '../../Arel';

describe('As', () => {
  describe('#as', () => {
    it('makes an AS node', () => {
      const attr = new Arel.Table('users').column('id');
      const as = attr.as(Arel.sql('foo'));

      expect(as.left).toBe(attr);
      expect(as.right.value).toBe('foo');
    });

    it('converts right to SqlLiteral if a string', () => {
      const attr = new Arel.Table('users').column('id');
      const as = attr.as('foo');
      expect(as.right).toBeInstanceOf(Arel.nodes.SqlLiteral);
    });
  });

  // describe('equality', () => {});
});
