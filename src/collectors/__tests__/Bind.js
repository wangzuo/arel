import * as Arel from '../../Arel';
import Bind from '../Bind';
import ToSql from '../../visitors/ToSql';

const { Table, SelectManager } = Arel;
const { BindParam } = Arel.nodes;

const _visitor = new ToSql(Table.engine.connection);

function collect(node) {
  return _visitor.accept(node, new Bind());
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

test('leaves binds', () => {
  const node = new BindParam();
  const list = compile(node);

  expect(node).toBe(list[0]);
  expect(node.constructor).toBe(list[0].constructor);
});

test('adds strings', () => {
  const bv = new BindParam();
  const list = compile(astWithBinds(bv));
  const binds = list.filter(x => x instanceof BindParam);

  expect(list.length > 0).toBe(true);
  expect(bv).toBe(binds[0]);
  expect(bv.constructor).toBe(binds[0].constructor);
});

test('substitute binds', () => {
  const bv = new BindParam();
  const collector = collect(astWithBinds(bv));
  const offsets = collector.value
    .map((v, i) => [v, i])
    .filter(([x, _]) => x instanceof BindParam)
    .map(([v, i]) => i);

  const list = collector.substituteBinds(['hello', 'world']);

  expect(list[offsets[0]]).toBe('hello');
  expect(list[offsets[1]]).toBe('world');
});

test('compile', () => {
  const bv = new BindParam();
  const collector = collect(astWithBinds(bv));
  const sql = collector.compile(['hello', 'world']);
  expect(sql).toBe(
    `SELECT FROM "users" WHERE "users"."age" = hello AND "users"."name" = world`
  );
});
