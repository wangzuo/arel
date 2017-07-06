import { Base } from '../../__fixtures__/FakeRecord';
import { Table } from '../../';
import SelectManager from '../../SelectManager';
import Bind from '../Bind';
import ToSql from '../../visitors/ToSql';
import { BindParam } from '../../nodes';

const conn = new Base();
const visitor = new ToSql(conn.connection);

function collect(node) {
  return visitor.accept(node, new Bind());
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

test('leave binds', () => {
  const node = new BindParam();
  const list = compile(node);
  expect(node).toEqual(list.first);
});

test('adds strings', () => {
  const bv = new BindParam();
  const list = compile(astWithBinds(bv));
  expect(list.length > 0).toBe(true);
  expect(bv).toEqual(list.grep(BindParam).first);
  expect(bv.constructor).toEqual(BindParam.first.constructor);
});

test('substitute binds', () => {
  const bv = new BindParam();
  const collector = collect(astWithBinds(bv));
  const values = collector.value;
});

test('compile', () => {
  const bv = new BindParam();
  const collector = collect(astWithBinds(bv));
  const sql = collector.compile(['hello', 'world']);
  expect(sql).toBe(
    'SELECT FROM "users" WHERE "users"."age" = hello AND "users"."name" = world'
  );
});
