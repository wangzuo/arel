import includes from 'lodash/includes';
import zipObject from 'lodash/zipObject';
import isNull from 'lodash/isNull';
import isNumber from 'lodash/isNumber';
import { ToSql } from './visitors';

class Column {
  constructor(name, type) {
    this.name = name;
    this.type = type;
  }
}

class Connection {
  constructor(visitor = null) {
    this._tables = ['users', 'photos', 'developers', 'products'];

    this._columns = {
      users: [
        new Column('id', 'integer'),
        new Column('name', 'string'),
        new Column('bool', 'boolean'),
        new Column('created_at', 'date')
      ],
      products: [new Column('id', 'integer'), new Column('price', 'decimal')]
    };

    this._columnsHash = {
      users: zipObject(
        this._columns.users.map(x => x.name),
        this._columns.users
      ),
      products: zipObject(
        this._columns.products.map(x => x.name),
        this._columns.products
      )
    };

    this._primaryKeys = {
      users: 'id',
      products: 'id'
    };

    this.visitor = visitor;
  }

  columnsHash(tableName) {
    return this._columnsHash[tableName];
  }

  primaryKey(name) {
    return this._primaryKeys[name];
  }

  dataSourceExists(name) {
    return includes(this.tables, name);
  }

  columns(name, message = null) {
    return this._columns(name);
  }

  quoteTableName(name) {
    return `"${name}"`;
  }

  quoteColumnName(name) {
    return `"${name}"`;
  }

  get schemaCache() {
    return this;
  }

  quote(thing) {
    if (thing === true) {
      return `'t'`;
    } else if (thing === false) {
      return `'f'`;
    } else if (isNull(thing)) {
      return 'NULL';
    } else if (isNumber(thing)) {
      return thing;
    }

    return `'${thing.toString().replace("'", "\\\\'")}'`;
  }
}

class Spec {
  constructor(config) {
    this.config = config;
  }
}

class ConnectionPool {
  constructor() {
    this.spec = new Spec({ adapter: 'america' });
    this.connection = new Connection();
    this.connection.visitor = new ToSql(this.connection);
  }

  withConnection(fn) {
    return fn(connection);
  }

  tableExists(name) {
    return includes(this.connection.tables, name);
  }

  get columnsHash() {
    return this.connection._columnsHash;
  }

  get schemaCache() {
    return this.connection;
  }

  quote(thing) {
    return this.connection.quote(thing);
  }
}

export class Base {
  constructor() {
    this.connectionPool = new ConnectionPool();
  }

  get connection() {
    return this.connectionPool.connection;
  }
}
