import extend from 'lodash/extend';
import PlainString from './collectors/PlainString';
import SQLString from './collectors/SQLString';

export default class TreeManager {
  constructor() {
    const { default: FactoryMethods } = require('./FactoryMethods');

    this.ctx = null;
    extend(this, FactoryMethods);
  }

  clone() {}

  toDot() {
    const { default: Dot } = require('./visitors/Dot');
    const collector = new Dot().accept()(this.ast, new PlainString());
    return collector.value();
  }

  toSql(engine) {
    const { Table } = require('./Arel');
    engine = engine || Table.engine;

    const collector = engine.connection.visitor.accept(
      this.ast,
      new SQLString()
    );

    // TODO: output sql function
    return collector.value.replace(/\s\s+/g, ' ').trim();
  }

  where(expr) {
    if (expr instanceof TreeManager) {
      expr = expr.ast;
    }
    this.ctx.wheres.push(expr);

    return this;
  }
}
