# Arel
[![Build Status](https://travis-ci.org/wangzuo/arel.svg?branch=master)](https://travis-ci.org/wangzuo/arel) [![codecov](https://codecov.io/gh/wangzuo/arel/branch/master/graph/badge.svg)](https://codecov.io/gh/wangzuo/arel) [![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

[rails/arel](https://github.com/rails/arel) in javascript

### Installation
``` sh
npm i arel --save
```

### Usage
``` javascript
import * as Arel from 'arel'; // es6
// const Arel = require('arel');

const users = new Arel.Table('users');
const query = users.project(Arel.sql('*'));
query.toSql(); // => SELECT * FROM "users"
```

### More examples
``` javascript
users.where(users.column('name').eq('amy'))
// => SELECT * FROM users WHERE users.name = 'amy'

users.project(users.column('id'))
// => SELECT users.id FROM users
```

### License
MIT
