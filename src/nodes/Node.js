import extend from 'lodash/extend';
// import Not from './Not';
// import And from './And';
// import Table from '../Table';
// import SQLString from '../collectors/SQLString';
// import Or from './Or';

export default class Node {
  constructor() {
    const FactoryMethods = require('../FactoryMethods').default;
    extend(this, FactoryMethods);
  }

  not() {
    return new Not(this);
  }

  or(right) {
    return new Grouping(new Or(this, right));
  }

  and(right) {
    return new And([this, right]);
  }

  toSql(engine = Table.engine) {
    const collector = engine.connection.visitor.accept(this, new SQLString());
    return collector.value();
  }

  each(block) {}
}
