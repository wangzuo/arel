import extend from 'lodash/extend';
import SQLString from '../collectors/SQLString';

export default class Node {
  constructor() {
    const { default: FactoryMethods } = require('../FactoryMethods');
    extend(this, FactoryMethods);
  }

  not() {
    return new Not(this);
  }

  or(right) {
    const { Grouping, Or } = require('../nodes');
    return new Grouping(new Or(this, right));
  }

  and(right) {
    const { And } = require('../nodes');
    return new And([this, right]);
  }

  toSql(engine) {
    const { Table } = require('../Arel');
    engine = engine || Table.engine;
    const collector = engine.connection.visitor.accept(this, new SQLString());
    return collector.value;
  }

  // todo
  each(block) {}
}
