const Arel = require('arel');
const { Table } = Arel;

test('toSql', () => {
  const users = new Table('users');
  const photos = new Table('photos');
  expect(users.project(Arel.sql('*')).toSql()).toBe(`SELECT * FROM "users"`);

  expect(users.project(users.column('id')).toSql()).toBe(
    `SELECT "users"."id" FROM "users"`
  );

  expect(users.where(users.column('name').eq('amy')).toSql()).toBe(
    `SELECT FROM "users" WHERE "users"."name" = 'amy'`
  );

  expect(
    users
      .join(photos)
      .on(users.column('id').eq(photos.column('user_id')))
      .toSql()
  ).toBe(
    `SELECT FROM "users" INNER JOIN "photos" ON "users"."id" = "photos"."user_id"`
  );
});
