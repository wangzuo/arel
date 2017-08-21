import * as Arel from '../../Arel';
import SqlLiteral from '../SqlLiteral';

const { ToSql } = Arel.visitors;
const { SQLString } = Arel.collectors;
const _visitor = new ToSql(Arel.Table.engine.connection);

function compile(node) {
  return _visitor.accept(node, new SQLString()).value;
}

describe('SqlLiteral', () => {
  describe('sql', () => {
    it('makes a sql literal node', () => {
      const sql = Arel.sql('foo');
      expect(sql).toBeInstanceOf(SqlLiteral);
    });
  });

  describe('count', () => {
    it('makes a count node', () => {
      const node = new SqlLiteral('*').count();
      expect(compile(node)).toBe('COUNT(*)');
    });

    it('makes a distinct node', () => {
      const node = new SqlLiteral('*').count(true);
      expect(compile(node)).toBe('COUNT(DISTINCT *)');
    });
  });

  describe('equality', () => {
    it('makes an equality node', () => {
      const node = new SqlLiteral('foo').eq(1);
      expect(compile(node)).toBe(`foo = 1`);
    });

    // TODO
    // it('is equal with equal contents', () => {});
    // it('is not equal with different contents', () => {});
  });

  describe('grouped "or" equality', () => {
    it('makes a grouping node with an or node', () => {
      const node = new SqlLiteral('foo').eqAny([1, 2]);
      expect(compile(node)).toBe(`(foo = 1 OR foo = 2)`);
    });
  });

  describe('grouped "and" equality', () => {
    it('makes a grouping node with an and node', () => {
      const node = new SqlLiteral('foo').eqAll([1, 2]);
      expect(compile(node)).toBe(`(foo = 1 AND foo = 2)`);
    });
  });

  // TODO
  // describe('serialization', () => {
  //   it('serializes into YAML', () => {});
  // });
});
