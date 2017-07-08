import * as Arel from '../../Arel';
import { Base } from '../../FakeRecord';
import SqlLiteral from '../SqlLiteral';
import SQLString from '../../collectors/SQLString';
import { ToSql } from '../../visitors';

const _visitor = new ToSql(new Base());

function compile(node) {
  _visitor.accept(node, new SQLString()).value;
}

describe('SqlLiteral', () => {
  describe('sql', () => {
    it('makes a sql literal node', () => {
      const sql = Arel.sql('foo');
      expect(sql).toBeInstanceOf(SqlLiteral);
    });
  });

  // describe('count', () => {
  //   it('makes a count node', () => {
  //     const node = new SqlLiteral('*').count();
  //     expect(compile(node)).toBe('COUNT(*)');
  //   });
  // });
});
