import { Base } from './src/__fixtures__/FakeRecord';
import * as Arel from './';

const { Table } = Arel;
Table.engine = new Base();

describe('test build', () => {
  test('toSql', () => {
    const users = new Table('user');
    expect(users.project(Arel.sql('*')).toSql()).toBe(`SELECT * FROM "user"`);
  });
});
