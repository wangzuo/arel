import * as Arel from '../../Arel';
import SQLString from '../../collectors/SQLString';
import SQLite from '../SQLite';

const _visitor = new SQLite(Arel.Table.engine.connection);

function compile(node) {
  return _visitor.accept(node, new SQLString()).value;
}

describe('SQLite', () => {
  it('defaults limit to -1', () => {
    const stmt = new Arel.nodes.SelectStatement();
    stmt.offset = new Arel.nodes.Offset(1);
    expect(compile(stmt)).toBe(`SELECT LIMIT -1 OFFSET 1`);
  });

  it('does not support locking', () => {
    const node = new Arel.nodes.Lock(Arel.sql('FOR UPDATE'));
    expect(compile(node)).toBe(``);
  });

  it('does not support boolean', () => {
    expect(compile(new Arel.nodes.True())).toBe('1');
    expect(compile(new Arel.nodes.False())).toBe('0');
  });
});
