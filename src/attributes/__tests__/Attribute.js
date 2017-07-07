import Table from '../../Table';
import { NotEqual } from '../../nodes';

describe('Attribute', () => {
  describe('#notEq', () => {
    it('should create a NotEqual node', () => {
      const relation = new Table('users');
      expect(relation.column('id').notEq(10)).toBeInstanceOf(NotEqual);
    });
  });
});
