import * as Arel from '../../Arel';
import MySQL from '../MySQL';
import SQLString from '../../collectors/SQLString';

const _visitor = new MySQL(Arel.Table.engine.connection);

// todo
function compile(node) {
  return _visitor
    .accept(node, new SQLString())
    .value.replace(/\s\s+/g, ' ')
    .trim();
}

describe('the mysql visitor', () => {
  it('squashes parenthesis on multiple unions #1', () => {
    const subnode = new Arel.nodes.Union(Arel.sql('left'), Arel.sql('right'));
    const node = new Arel.nodes.Union(subnode, Arel.sql('topright'));
    expect(compile(node)).toBe('( left UNION right UNION topright )');
  });

  it('squashes parenthesis on multiple unions #2', () => {
    const subnode = new Arel.nodes.Union(Arel.sql('left'), Arel.sql('right'));
    const node = new Arel.nodes.Union(Arel.sql('topleft'), subnode);
    expect(compile(node)).toBe('( topleft UNION left UNION right )');
  });

  // it('defaults limit to 18446744073709551615', () => {
  //   const stmt = new Arel.nodes.SelectStatement();
  //   stmt.offset = new Arel.nodes.Offset(1);
  //   expect(compile(stmt)).toBe(
  //     `SELECT FROM DUAL LIMIT 18446744073709551615 OFFSET 1`
  //   );
  // });

  it('should escape LIMIT', () => {
    const sc = new Arel.nodes.UpdateStatement();
    sc.relation = new Arel.Table('users');
    sc.limit = new Arel.nodes.Limit(Arel.nodes.buildQuoted('omg'));
    expect(compile(sc)).toBe(`UPDATE "users" LIMIT 'omg'`);
  });

  it('users DUAL for empty from', () => {
    const stmt = new Arel.nodes.SelectStatement();
    expect(compile(stmt)).toBe(`SELECT FROM DUAL`);
  });

  describe('locking', () => {
    it('defaults to FOR UPDATE when locking', () => {
      expect(compile(new Arel.nodes.Lock(Arel.sql('FOR UPDATE')))).toBe(
        'FOR UPDATE'
      );
    });

    it('allows a custom string to be used as a lock', () => {
      expect(compile(new Arel.nodes.Lock(Arel.sql('LOCK IN SHARE MODE')))).toBe(
        'LOCK IN SHARE MODE'
      );
    });
  });

  describe('concat', () => {
    it('concats columns', () => {
      const table = new Arel.Table('users');
      const query = table.column('name').concat(table.column('name'));
      expect(compile(query)).toBe(`CONCAT("users"."name", "users"."name")`);
    });

    it('concats a string', () => {
      const table = new Arel.Table('users');
      const query = table.column('name').concat(Arel.nodes.buildQuoted('abc'));
      expect(compile(query)).toBe(`CONCAT("users"."name", 'abc')`);
    });
  });
});
