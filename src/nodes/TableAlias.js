import Binary from './Binary';
import Attribute from '../attributes/Attribute';

export default class TableAlias extends Binary {
  get name() {
    return this.right;
  }

  get relation() {
    return this.left;
  }

  get tableAlias() {
    return this.name;
  }

  column(name) {
    return new Attribute(this, name);
  }

  get tableName() {
    if (this.relation.name) return this.relation.name;
    return this.name;
  }

  typeCastForDatabase(...args) {
    return this.relation.typeCastForDatabase(...args);
  }

  ableToTypeCast() {
    if (this.relation.ableToTypeCast) return this.relation.ableToTypeCast();
  }
}
