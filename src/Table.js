// @flow
import isNull from 'lodash/isNull';
import extend from 'lodash/extend';
import { Base } from './FakeRecord';
import Crud from './Crud';
import FactoryMethods from './FactoryMethods';
import SelectManager from './SelectManager';
import { TableAlias, InnerJoin, OuterJoin } from './nodes';
import { Attribute } from './attributes';

export default class Table {
  name: string;
  tableAlias: ?string;

  constructor(name: string, options = {}) {
    const as = options.as || null;
    const typeCaster = options.typeCaster || null;

    // const { default: Crud } = require('./Crud');
    // const { default: FactoryMethods } = require('./FactoryMethods');
    extend(this, Crud);
    extend(this, FactoryMethods);

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

  alias(name: string) {
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

  take(amount: number) {
    return this.from().take(amount);
  }

  skip(amount: number) {
    return this.from().skip(amount);
  }

  having(expr: string) {
    return this.from().having(expr);
  }

  column(name: string) {
    return new Attribute(this, name);
  }

  hash() {}
  eql() {}

  typeCastForDatabase(attributeName, value) {
    return this.typeCaster.typeCastForDatabase(attributeName, value);
  }

  ableToTypeCast() {
    return !isNull(this.typeCaster);
  }
}

Table.engine = new Base();
