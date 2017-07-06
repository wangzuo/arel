import Equality from '../Equality';
import { NotEqual } from '../Binary';

describe('Binary', () => {
  describe('#hash', () => {
    it('generates a hash based on its value', () => {
      const eq = new Equality('foo', 'bar');
      const eq2 = new Equality('foo', 'bar');
      const eq3 = new Equality('bar', 'baz');

      expect(eq.hash).toBe(eq2.hash);
      expect(eq.hash).not.toBe(eq3.hash);
    });

    it('generates a hash specific to its class', () => {
      const eq = new Equality('foo', 'bar');
      const neq = new NotEqual('foo', 'bar');

      expect(eq.hash).not.toBe(neq.hash);
    });
  });
});
