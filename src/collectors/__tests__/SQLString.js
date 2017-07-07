import ToSql from '../../visitors/ToSql';
import SQLString from '../SQLString';
import { Base } from '../../__fixtures__/FakeRecord';
import { Table } from '../../Arel';
const { BindParam } = require('../../nodes');
import SelectManager from '../../SelectManager';

const _conn = new Base();
const _visitor = new ToSql(_conn.connection);

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
