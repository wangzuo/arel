import * as Arel from 'arel';
import NamedFunc from '../NamedFunc';
import SqlLiteral from '../SqlLiteral';

test('construct', () => {
  const func = new NamedFunc('omg', 'zomg');
  expect(func.name).toBe('omg');
  expect(func.expressions).toBe('zomg');
});

test('function alias', () => {
  let func = new NamedFunc('omg', 'zomg');
  func = func.as('wth');
  expect(func.name).toBe('omg');
  expect(func.expressions).toBe('zomg');
  // todo: Arel.nodes.SqlLiteral
  expect(func.alias).toBeInstanceOf(SqlLiteral);
  expect(func.alias.value).toBe('wth');
});

test('construct with alias', () => {
  const func = new NamedFunc('omg', 'zomg', 'wth');
  expect(func.name).toBe('omg');
  expect(func.expressions).toBe('zomg');
  expect(func.alias).toBeInstanceOf(SqlLiteral);
  expect(func.alias.value).toBe('wth');
});

// todo
// test('equality with_same ivars', () => {});
// test('inequality with different ivars', () => {});
