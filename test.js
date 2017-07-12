const Arel = require('arel');
const { Table } = Arel;

describe('test build', () => {
  test('toSql', () => {
    const users = new Table('users');
    expect(users.project(Arel.sql('*')).toSql()).toBe(`SELECT * FROM "users"`);

    expect(users.project(users.column('id')).toSql()).toBe(
      `SELECT "users"."id" FROM "users"`
    );
  });
});
