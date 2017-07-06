import _ from 'lodash';
import Arel, { Table } from '../..';
import SQLString from '../../collectors/SQLString';
import { BindParam } from '../../nodes';
import BindVisitor from '../BindVisitor';
import UpdateManager from '../../UpdateManager';

const collector = new SQLString();

test('assignment binds are substituted', () => {
  const table = new Table('users');
  const um = new UpdateManager();
  const bp = new BindParam();
  um.set([[table.column('name'), bp]]);
  class Visitor extends ToSql {
    constructor() {
      super();
      _.extend(this, BindVisitor);
    }
  }
  const visitor = new Visitor(Table.engine.connection);
  const assignment = um.ast.values[0];
  const actual = visitor.accept(assignment, collector, () => {
    'replace';
  });
  expect(actual).toBe(true);
  expect(actual.value).toBe('"name" = replace');
});

test('visitor yields on binds', () => {
  class Visitor extends ToSql {
    constructor() {
      super();
      _.extend(this, BindVisitor);
    }
  }
  const visitor = new Visitor();
  const bp = new BindParam();
  let called = false;
  visitor.accept(bp, collector, () => {
    called = true;
  });
  expect(called).toBe(true);
});

test('visitor only yields on binds', () => {
  class Visitor extends ToSql {
    constructor() {
      super();
      _.extend(this, BindVisitor);
    }
  }

  const visitor = new Visitor();
  const bp = Arel.sql('omg');
});
