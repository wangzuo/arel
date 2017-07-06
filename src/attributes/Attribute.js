import _ from 'lodash';

export default class Attribute {
  constructor(relation, name) {
    this.relation = relation;
    this.name = name;

    const { default: Expressions } = require('../Expressions');
    const { default: Predications } = require('../Predications');
    const { default: AliasPredication } = require('../AliasPredication');
    const { default: OrderPredications } = require('../OrderPredications');
    const { Math } = require('../Math');

    _.extend(this, Expressions);
    _.extend(this, Predications);
    _.extend(this, AliasPredication);
    _.extend(this, OrderPredications);
    _.extend(this, Math);
  }

  lower() {
    return this.relation.lower(this);
  }

  typeCastForDatabase(value) {
    return this.relation.typeCastForDatabase(name, value);
  }

  ableToTypeCast() {
    return this.relation.ableToTypeCast();
  }
}

export class String extends Attribute {}
export class Time extends Attribute {}
export class Boolean extends Attribute {}
export class Decimal extends Attribute {}
export class Float extends Attribute {}
export class Integer extends Attribute {}
export class Undefined extends Attribute {}
