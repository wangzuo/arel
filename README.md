# Arel
[![Build Status](https://travis-ci.org/wangzuo/arel.svg?branch=master)](https://travis-ci.org/wangzuo/arel) [![codecov](https://codecov.io/gh/wangzuo/arel/branch/master/graph/badge.svg)](https://codecov.io/gh/wangzuo/arel) [![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

* http://github.com/rails/arel
* [API Documentation](http://www.rubydoc.info/github/rails/arel)

## DESCRIPTION

Arel Really Exasperates Logicians

Arel is a SQL AST manager for Ruby. It

1. simplifies the generation of complex SQL queries, and
2. adapts to various RDBMSes.

It is intended to be a framework framework; that is, you can build your own ORM
with it, focusing on innovative object and collection modeling as opposed to
database compatibility and query generation.

## Status

For the moment, Arel uses Active Record's connection adapters to connect to the various engines and perform connection pooling, quoting, and type conversion.

## A Gentle Introduction

Generating a query with Arel is simple. For example, in order to produce

```sql
SELECT * FROM users
```

you construct a table relation and convert it to SQL:

```javascript
import Arel, { Table } from 'arel';

users = new Table('users');
query = users.project(Arel.sql('*'));
query.toSql();
```

### More Sophisticated Queries

Here is a whirlwind tour through the most common SQL operators. These will probably cover 80% of all interaction with the database.

First is the 'restriction' operator, `where`:

```javascript
users.where(users.column('name').eq('amy'))
// => SELECT * FROM users WHERE users.name = 'amy'
```

What would, in SQL, be part of the `SELECT` clause is called in Arel a `projection`:

```javascript
users.project(users.column('id'))
# => SELECT users.id FROM users
```

Comparison operators `=`, `!=`, `<`, `>`, `<=`, `>=`, `IN`:

```javascript
users.where(users.column('age').eq(10)).project(Arel.sql('*'))
# => SELECT * FROM "users"  WHERE "users"."age" = 10

users.where(users.column('age').not_eq(10)).project(Arel.sql('*'))
# => SELECT * FROM "users"  WHERE "users"."age" != 10

users.where(users.column('age').lt(10)).project(Arel.sql('*'))
# => SELECT * FROM "users"  WHERE "users"."age" < 10

users.where(users.column('age').gt(10)).project(Arel.sql('*'))
# => SELECT * FROM "users"  WHERE "users"."age" > 10

users.where(users.column('age').lteq(10)).project(Arel.sql('*'))
# => SELECT * FROM "users"  WHERE "users"."age" <= 10

users.where(users.column('age').gteq(10)).project(Arel.sql('*'))
# => SELECT * FROM "users"  WHERE "users"."age" >= 10

users.where(users.column('age').in([20, 16, 17])).project(Arel.sql('*'))
# => SELECT * FROM "users"  WHERE "users"."age" IN (20, 16, 17)
```

Bitwise operators `&`, `|`, `^`, `<<`, `>>`:

```javascript
users.where((users.column('bitmap') & 16).gt(0)).project(Arel.sql('*'))
# => SELECT * FROM "users"  WHERE ("users"."bitmap" & 16) > 0

users.where((users.column('bitmap') | 16).gt(0)).project(Arel.sql('*'))
# => SELECT * FROM "users"  WHERE ("users"."bitmap" | 16) > 0

users.where((users.column('bitmap') ^ 16).gt(0)).project(Arel.sql('*'))
# => SELECT * FROM "users"  WHERE ("users"."bitmap" ^ 16) > 0

users.where((users.column('bitmap') << 1).gt(0)).project(Arel.sql('*'))
# => SELECT * FROM "users"  WHERE ("users"."bitmap" << 1) > 0

users.where((users.column('bitmap') >> 1).gt(0)).project(Arel.sql('*'))
# => SELECT * FROM "users"  WHERE ("users"."bitmap" >> 1) > 0

users.where((~ users.column('bitmap')).gt(0)).project(Arel.sql('*'))
# => SELECT * FROM "users" WHERE  ~ "users"."bitmap" > 0
```

Joins resemble SQL strongly:

```javascript
users.join(photos).on(users.column('id').eq(photos.column('user_id'))
# => SELECT * FROM users INNER JOIN photos ON users.id = photos.user_id
```

Left joins:

```javascript
import { OuterJoin } from 'arel/nodes';
users.join(photos, OuterJoin).on(users.column('id').eq(photos.column('user_id')))
# => SELECT FROM users LEFT OUTER JOIN photos ON users.id = photos.user_id
```

What are called `LIMIT` and `OFFSET` in SQL are called `take` and `skip` in Arel:

```javascript
users.take(5) # => SELECT * FROM users LIMIT 5
users.skip(4) # => SELECT * FROM users OFFSET 4
```

`GROUP BY` is called `group`:

```javascript
users.project(users.column('name')).group(users.column('name'))
// => SELECT users.name FROM users GROUP BY users.name
```

The best property of Arel is its "composability," or closure under all operations. For example, to restrict AND project, just "chain" the method invocations:

```javascript
users
  .where(users.column('name').eq('amy'))
  .project(users.column('id'))
// => SELECT users.id FROM users WHERE users.name = 'amy'
```

All operators are chainable in this way, and they are chainable any number of times, in any order.

```javascript
users.where(users.column('name').eq('bob')).where(users.column('age').lt(25))
```

The `OR` operator works like this:

```javascript
users.where(users.column('name').eq('bob').or(users.column('age').lt(25)))
```

The `AND` operator behaves similarly. Here is an example of the `DISTINCT` operator:

```javascript
import { Table } from 'arel';
posts = new Table('posts');
posts.project(posts.column('title'))
posts.distinct()
posts.toSql() // => 'SELECT DISTINCT "posts"."title" FROM "posts"'
```

Aggregate functions `AVG`, `SUM`, `COUNT`, `MIN`, `MAX`, `HAVING`:

```javascript
photos.group(photos.column('user_id')).having(photos.column('id').count.gt(5))
// => SELECT FROM photos GROUP BY photos.user_id HAVING COUNT(photos.id) > 5

users.project(users.column('age').sum())
// => SELECT SUM(users.age) FROM users

users.project(users.column('age').average())
// => SELECT AVG(users.age) FROM users

users.project(users.column('age').maximum())
// => SELECT MAX(users.age) FROM users

users.project(users.column('age').minimum())
// => SELECT MIN(users.age) FROM users

users.project(users.column('age').count())
// => SELECT COUNT(users.age) FROM users
```

Aliasing Aggregate Functions:

```javascript
users.project(users.column('age').average.as('mean_age'))
// => SELECT AVG(users.age) AS mean_age FROM users
```

### The Crazy Features

The examples above are fairly simple and other libraries match or come close to matching the expressiveness of Arel (e.g. `Sequel` in Ruby).

#### Inline math operations

Suppose we have a table `products` with prices in different currencies. And we have a table `currency_rates`, of constantly changing currency rates. In Arel:

```javascript
import { Table } from 'arel';
const products = new Table('posts');
// Attributes: ['id', 'name', 'price', 'currency_id']

const currencyRates = new Table('currency_rates');
// Attributes: ['from_id', 'to_id', 'date', 'rate']
```

Now, to order products by price in user preferred currency simply call:

```javascript
products
  .join('currency_rates').on(products.column('currency_id').eq(currency_rates.column('from_id')))
  .where(currency_rates.column('to_id').eq(user_preferred_currency), currency_rates.column('date').eq(Date.today))
  .order(products.column('price') * currency_rates.column('rate'))
```

#### Complex Joins

Where Arel really shines is in its ability to handle complex joins and aggregations. As a first example, let's consider an "adjacency list", a tree represented in a table. Suppose we have a table `comments`, representing a threaded discussion:

```javascript
import { Table } from 'arel';
const comments = new Table('comments');
```

And this table has the following attributes:

```javascript
// ['id', 'body', 'parent_id']
```

The `parent_id` column is a foreign key from the `comments` table to itself.
Joining a table to itself requires aliasing in SQL. This aliasing can be handled from Arel as below:

```javascript
const replies = comments.alias()
const commentsWithReplies = comments
  .join(replies).on(replies.column('parent_id').eq(comments.column('id'))
  .where(comments.column('id').eq(1))
// => SELECT * FROM comments INNER JOIN comments AS comments_2
//    WHERE comments_2.parent_id = comments.id AND comments.id = 1
```

This will return the reply for the first comment.

[Common Table Expressions (CTE)](https://en.wikipedia.org/wiki/Common_table_expressions#Common_table_expression) support via:

Create a `CTE`

```javascript
import { As } from 'arel/nodes';
const cteTable = new Table('cte_table');
const composedCte = new As(cteTable, photos.where(photos.column('created_at').gt(Date.now())))
```

Use the created `CTE`:

```javascript
users
  .join(cteTable).on(users.column('id').eq(cteTable.column('user_id')))
  .project(users.column('id'), cteTable.column('click').sum())
  .with(composedCte)

// => WITH cteTable AS (SELECT FROM photos  WHERE photos.created_at > '2014-05-02')
//    SELECT users.id, SUM(cte_table.click)
//    FROM users INNER JOIN cteTable ON users.id = cteTable.user_id
```

When your query is too complex for `Arel`, you can use `Arel::SqlLiteral`:

```javascript
import { SqlLiteral } from 'arel/nodes';

const photoClicks = new SqlLiteral(`
  CASE WHEN condition1 THEN calculation1
  WHEN condition2 THEN calculation2
  WHEN condition3 THEN calculation3
  ELSE default_calculation END
`)

photos.project(photoClicks.as('photo_clicks'))
// => SELECT CASE WHEN condition1 THEN calculation1
//    WHEN condition2 THEN calculation2
//    WHEN condition3 THEN calculation3
//    ELSE default_calculation END
//    FROM "photos"
```

## Contributing to Arel

Arel is the work of many contributors. You're encouraged to submit pull requests, propose
features and discuss issues.

See [CONTRIBUTING](CONTRIBUTING.md).

## License
Arel is released under the [MIT License](http://www.opensource.org/licenses/MIT).
