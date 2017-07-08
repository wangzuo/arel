import _ from 'lodash';
import * as Arel from '../../Arel';
import SQLString from '../../collectors/SQLString';
import BindVisitor from '../BindVisitor';
import UpdateManager from '../../UpdateManager';
import ToSql from '../ToSql';

const { Table } = Arel;
const { BindParam } = Arel.nodes;

class Visitor extends BindVisitor(ToSql) {}

test('assignment binds are substituted', () => {
  const collector = new SQLString();
  const table = new Table('users');
  const um = new UpdateManager();
  const bp = new BindParam();
  um.set([[table.column('name'), bp]]);
  const visitor = new Visitor(Table.engine.connection);
  const assignment = um.ast.values[0];
  const actual = visitor.accept(assignment, collector, () => 'replace');
  expect(actual.value).toBe('"name" = replace');
});

test('visitor yields on binds', () => {
  const collector = new SQLString();
  const visitor = new Visitor(null);
  const bp = new BindParam();
  let called = false;
  visitor.accept(bp, collector, () => {
    called = true;
  });
  expect(called).toBe(true);
});

test('visitor only yields on binds', () => {
  const collector = new SQLString();
  const visitor = new Visitor(null);
  const bp = Arel.sql('omg');
  let called = false;

  visitor.accept(bp, collector, () => {
    called = true;
  });

  expect(called).toBe(false);
});
