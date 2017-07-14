import * as Arel from '../../Arel';
import IBM_DB from '../IBM_DB';
import SQLString from '../../collectors/SQLString';

const _visitor = new IBM_DB(Arel.Table.engine.connection);

function compile(node) {
  return _visitor.accept(node, new SQLString()).value;
}

describe('IBM_DB', () => {
  it('uses FETCH FIRST n ROWS to limit results', () => {
    const stmt = new Arel.nodes.SelectStatement();
    stmt.limit = new Arel.nodes.Limit(1);
    expect(compile(stmt)).toBe(`SELECT FETCH FIRST 1 ROWS ONLY`);
  });

  it('uses FETCH FIRST n ROWS in updates with a limit', () => {
    const table = new Arel.Table('users');
    const stmt = new Arel.nodes.UpdateStatement();
    stmt.relation = table;
    stmt.limit = new Arel.nodes.Limit(Arel.nodes.buildQuoted(1));
    stmt.key = table.column('id');
    expect(compile(stmt)).toBe(
      `UPDATE "users" WHERE "users"."id" IN (SELECT "users"."id" FROM "users" FETCH FIRST 1 ROWS ONLY)`
    );
  });
});
