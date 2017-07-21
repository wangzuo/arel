import * as Arel from '../../Arel';
import { Or } from '../../nodes';

describe('Or', () => {
  describe('#or', () => {
    it('makes an OR node', () => {
      const attr = new Arel.Table('users').column('id');
      const left = attr.eq(10);
      const right = attr.eq(11);
      const node = left.or(right);

      expect(node.expr.left).toBe(left);
      expect(node.expr.right).toBe(right);

      const oror = node.or(right);
      expect(oror.expr.left).toBe(node);
      expect(oror.expr.right).toBe(right);

      expect(oror.toSql()).toBe(
        `(("users"."id" = 10 OR "users"."id" = 11) OR "users"."id" = 11)`
      );
    });
  });

  // todo
  // describe('equality', () => {
  //   it('is equal with equal ivars', () => {});
  //   it('is not equal with different ivars', () => {});
  // });
});
