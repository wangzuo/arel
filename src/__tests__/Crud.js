import _ from 'lodash';
import { Table } from '../Arel';
import Crud from '../Crud';
import SelectManager from '../SelectManager';
import InsertManager from '../InsertManager';
import UpdateManager from '../UpdateManager';
import DeleteManager from '../DeleteManager';
import { Attribute } from '../attributes';

class FakeEngine {
  constructor() {
    this.calls = [];
    this.connectionPoll = this;
    this.sepc = this;
    this.config = { adapter: 'sqlite3' };

    _.extend(this, Crud);
  }

  get connection() {
    return this;
  }
}

class FakeCrudder extends SelectManager {
  constructor() {
    super();

    this.engine = new FakeEngine();
    _.extend(this, Crud);
  }
}

describe('insert', () => {
  it('should call insert on the connection', () => {
    const table = new Table('users');
    const fc = new FakeCrudder();
    fc.from(table);
    const im = fc.compileInsert([[table.column('id')], 'foo']);
    expect(im).toBeInstanceOf(InsertManager);
  });
});

describe('update', () => {
  it('should call update on the connection', () => {
    const table = new Table('users');
    const fc = new FakeCrudder();
    fc.from(table);
    const stmt = fc.compileUpdate(
      [[table.column('id')], 'foo'],
      new Attribute(table, 'id')
    );
    expect(stmt).toBeInstanceOf(UpdateManager);
  });
});

describe('delete', () => {
  it('should call delete on the connection', () => {
    const table = new Table('users');
    const fc = new FakeCrudder();
    fc.from(table);
    const stmt = fc.compileDelete();
    expect(stmt).toBeInstanceOf(DeleteManager);
  });
});
