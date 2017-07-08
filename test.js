const Arel = require('arel');
const { Table } = Arel;

describe('test build', () => {
  test('toSql', () => {
    const users = new Table('user');
    expect(users.project(Arel.sql('*')).toSql()).toBe(`SELECT * FROM "user"`);

    // expect(users.where(users.column('name').eq('amy')).toSql()).toBe(
    //   `SELECT * FROM users WHERE users.name = 'amy'`
    // );
    // expect(users.project(users.column('id')).toSql()).toBe(
    //   `SELECT users.id FROM users`
    // );
  });
});
