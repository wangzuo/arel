import _ from 'lodash';
import TreeManager from './TreeManager';

export default class InsertManager extends TreeManager {
  constructor() {
    super();

    const { default: InsertStatement } = require('./nodes/InsertStatement');
    this.ast = new InsertStatement();
  }

  into(table) {
    this.ast.relation = table;
    return this;
  }

  get columns() {
    return this.ast.columns;
  }

  set values(val) {
    this.ast.values = val;
  }

  select(select) {
    this.ast.select = select;
  }

  insert(fields) {
    if (_.isEmpty(fields)) return;

    if (_.isString(fields)) {
      const { default: SqlLiteral } = require('./nodes/SqlLiteral');
      this.ast.values = new SqlLiteral(fields);
    } else {
      this.ast.relation = this.ast.relation || fields[0][0].relation;
      const values = [];

      fields.forEach(field => {
        this.ast.columns.push(field[0]);
        values.push(field[1]);
      });

      this.ast.values = this.createValues(values, this.ast.columns);
    }

    return this;
  }

  createValues(values, columns) {
    const { Values } = require('./nodes');
    return new Values(values, columns);
  }

  createValuesList(rows) {
    const { ValuesList } = require('./nodes');
    return new ValuesList(rows);
  }
}
