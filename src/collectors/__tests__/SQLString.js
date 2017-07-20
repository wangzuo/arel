import * as Arel from '../../Arel';
import ToSql from '../../visitors/ToSql';
import SQLString from '../SQLString';

const { Table, SelectManager } = Arel;
const { BindParam } = Arel.nodes;

const _visitor = new ToSql(Table.engine.connection);

function collect(node) {
  return _visitor.accept(node, new SQLString());
}

function compile(node) {
  return collect(node).value;
}

function astWithBinds(bv) {
  const table = new Table('users');
  const manager = new SelectManager(table);
  manager.where(table.column('age').eq(bv));
  manager.where(table.column('name').eq(bv));
  return manager.ast;
}

test('compile', () => {
  const bv = new BindParam();
  const collector = collect(astWithBinds(bv));
  const sql = collector.compile(['hello', 'world']);
  expect(sql).toEqual(
    'SELECT FROM "users" WHERE "users"."age" = ? AND "users"."name" = ?'
  );
});
