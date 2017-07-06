import _ from 'lodash';
import TableAlias from './nodes/TableAlias';
import SelectManager from './SelectManager';
import InnerJoin from './nodes/InnerJoin';
import OuterJoin from './nodes/OuterJoin';
import Attribute from './attributes/Attribute';

export default class Table {
  constructor(name, options = {}) {
    const as = options.as || null;
    const typeCaster = options.typeCaster || null;

    const { default: Crud } = require('./Crud');
    const { default: FactoryMethods } = require('./FactoryMethods');
    _.extend(this, Crud);
    _.extend(this, FactoryMethods);

    this.name = name;
    this.typeCaster = typeCaster || null;

    if (as === this.name) {
      this.tableAlias = null;
    } else {
      this.tableAlias = as;
    }
  }

  get tableName() {
    return this.name;
  }

  alias(name) {
    name = name || `${this.name}_2`;
    return new TableAlias(this, name);
  }

  from() {
    return new SelectManager(this);
  }

  join(relation, klass = InnerJoin) {
    if (!relation) return this.from();

    return this.from().join(relation, klass);
  }

  outerJoin(relation) {
    return this.join(relation, OuterJoin);
  }

  group(...columns) {
    return this.from().group(...columns);
  }

  order(expr) {
    return this.from().order(expr);
  }

  where(condition) {
    return this.from().where(condition);
  }

  project(...things) {
    return this.from().project(...things);
  }

  take(amount) {
    return this.from().take(amount);
  }

  skip(amount) {
    return this.from().skip(amount);
  }

  having(expr) {
    return this.from().having(expr);
  }

  column(name) {
    return new Attribute(this, name);
  }

  hash() {}
  eql() {}
  typeCastForDatabase() {}
  ableToTypeCast() {}
}
