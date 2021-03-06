import isEmpty from 'lodash/isEmpty';
import isString from 'lodash/isString';
import TreeManager from './TreeManager';

export default class InsertManager extends TreeManager {
  constructor() {
    super();

    const { InsertStatement } = require('./nodes');
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
    if (isEmpty(fields)) return;

    if (isString(fields)) {
      const { SqlLiteral } = require('./nodes');
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
