import * as Arel from '../Arel';
const { Table } = Arel;

test('Arel', () => {
  const users = new Table('users');
  const photos = new Table('photos');

  expect(users.project(Arel.sql('*')).toSql()).toBe(`SELECT * FROM "users"`);

  expect(users.where(users.column('name').eq('amy')).toSql()).toBe(
    `SELECT FROM "users" WHERE "users"."name" = 'amy'`
  );

  expect(users.project(users.column('id')).toSql()).toBe(
    `SELECT "users"."id" FROM "users"`
  );

  expect(
    users.where(users.column('age').eq(10)).project(Arel.sql('*')).toSql()
  ).toBe(`SELECT * FROM "users" WHERE "users"."age" = 10`);

  expect(
    users.where(users.column('age').notEq(10)).project(Arel.sql('*')).toSql()
  ).toBe(`SELECT * FROM "users" WHERE "users"."age" != 10`);

  expect(
    users.where(users.column('age').lt(10)).project(Arel.sql('*')).toSql()
  ).toBe(`SELECT * FROM "users" WHERE "users"."age" < 10`);

  expect(
    users.where(users.column('age').gt(10)).project(Arel.sql('*')).toSql()
  ).toBe(`SELECT * FROM "users" WHERE "users"."age" > 10`);

  expect(
    users.where(users.column('age').lteq(10)).project(Arel.sql('*')).toSql()
  ).toBe(`SELECT * FROM "users" WHERE "users"."age" <= 10`);

  expect(
    users.where(users.column('age').gteq(10)).project(Arel.sql('*')).toSql()
  ).toBe(`SELECT * FROM "users" WHERE "users"."age" >= 10`);

  expect(
    users
      .where(users.column('age').in([20, 16, 17]))
      .project(Arel.sql('*'))
      .toSql()
  ).toBe(`SELECT * FROM "users" WHERE "users"."age" IN (20, 16, 17)`);

  expect(
    users
      .join(photos)
      .on(users.column('id').eq(photos.column('user_id')))
      .toSql()
  ).toBe(
    `SELECT FROM "users" INNER JOIN "photos" ON "users"."id" = "photos"."user_id"`
  );

  expect(
    users
      .join(photos, Arel.nodes.OuterJoin)
      .on(users.column('id').eq(photos.column('user_id')))
      .toSql()
  ).toBe(
    `SELECT FROM "users" LEFT OUTER JOIN "photos" ON "users"."id" = "photos"."user_id"`
  );

  expect(users.take(5).toSql()).toBe(`SELECT FROM "users" LIMIT 5`);
  expect(users.skip(4).toSql()).toBe(`SELECT FROM "users" OFFSET 4`);

  expect(
    users.project(users.column('name')).group(users.column('name')).toSql()
  ).toBe(`SELECT "users"."name" FROM "users" GROUP BY "users"."name"`);

  expect(
    users
      .where(users.column('name').eq('amy'))
      .project(users.column('id'))
      .toSql()
  ).toBe(`SELECT "users"."id" FROM "users" WHERE "users"."name" = 'amy'`);

  expect(
    users
      .where(users.column('name').eq('bob'))
      .where(users.column('age').lt(25))
      .toSql()
  ).toBe(
    `SELECT FROM "users" WHERE "users"."name" = 'bob' AND "users"."age" < 25`
  );

  expect(
    users
      .where(users.column('name').eq('bob').or(users.column('age').lt(25)))
      .toSql()
  ).toBe(
    `SELECT FROM "users" WHERE ("users"."name" = 'bob' OR "users"."age" < 25)`
  );

  expect(users.project(users.column('name')).distinct().toSql()).toBe(
    `SELECT DISTINCT "users"."name" FROM "users"`
  );

  expect(
    photos
      .group(photos.column('user_id'))
      .having(photos.column('id').count().gt(5))
      .toSql()
  ).toBe(
    `SELECT FROM "photos" GROUP BY "photos"."user_id" HAVING COUNT("photos"."id") > 5`
  );

  expect(users.project(users.column('age').sum()).toSql()).toBe(
    `SELECT SUM("users"."age") FROM "users"`
  );

  expect(users.project(users.column('age').average()).toSql()).toBe(
    `SELECT AVG("users"."age") FROM "users"`
  );

  expect(users.project(users.column('age').maximum()).toSql()).toBe(
    `SELECT MAX("users"."age") FROM "users"`
  );

  expect(users.project(users.column('age').minimum()).toSql()).toBe(
    `SELECT MIN("users"."age") FROM "users"`
  );

  expect(users.project(users.column('age').count()).toSql()).toBe(
    `SELECT COUNT("users"."age") FROM "users"`
  );

  expect(
    users.project(users.column('age').average().as('mean_age')).toSql()
  ).toBe(`SELECT AVG("users"."age") AS mean_age FROM "users"`);
});
