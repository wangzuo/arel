import _ from 'lodash';
import PlainString from './collectors/PlainString';
import SQLString from './collectors/SQLString';

export default class TreeManager {
  constructor() {
    const { default: FactoryMethods } = require('./FactoryMethods');

    this.ctx = null;
    this.bindValues = [];
    _.extend(this, FactoryMethods);
  }

  toDot() {
    const { default: Dot } = require('./visitors/Dot');
    const collector = new Dot().accept()(this.ast, new PlainString());
    return collector.value();
  }

  toSql(engine) {
    const { default: Table } = require('./Table');
    engine = engine || Table.engine;

    const collector = engine.connection.visitor.accept(
      this.ast,
      new SQLString()
    );

    return collector.value.replace(/\s\s+/g, ' ').trim();
  }

  where(expr) {
    if (expr instanceof TreeManager) {
      expr = expr.last;
    }
    this.ctx.wheres.push(expr);
    return this;
  }
}
