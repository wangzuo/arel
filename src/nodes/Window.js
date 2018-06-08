// @flow
import isString from 'lodash/isString';
import Node from './Node';
import Unary from './Unary';

export default class Window extends Node {
  constructor() {
    super();
    this.orders = [];
    this.partitions = [];
    this.framing = null;
  }

  order(...expr) {
    const { SqlLiteral } = require('../nodes');
    this.orders = this.orders.concat(
      expr.map(x => (isString(x) ? new SqlLiteral(x) : x))
    );

    return this;
  }

  partition(...expr) {
    const { SqlLiteral } = require('../nodes');
    this.partitions = this.partitions.concat(
      expr.map(x => (isString(x) ? new SqlLiteral(x) : x))
    );

    return this;
  }

  frame(expr) {
    this.framing = expr;
  }

  rows(expr = null) {
    if (this.framing) {
      return new Rows(expr);
    }

    return this.frame(new Rows(expr));
  }

  range(expr = null) {
    if (this.framing) {
      return new Range(expr);
    }
    return this.frame(new Range(expr));
  }

  hash() {}

  eql() {}
}

export class NamedWindow extends Window {
  name: string;

  constructor(name: string) {
    super();
    this.name = name;
  }

  hash() {}

  eql() {}
}

class Rows extends Unary {
  constructor(expr = null) {
    super(expr);
  }
}

class Range extends Unary {
  constructor(expr = null) {
    super(expr);
  }
}

export class CurrentRow extends Node {
  get hash() {}

  eql() {}
}

export class Preceding extends Unary {
  constructor(expr = null) {
    super(expr);
  }
}

export class Following extends Unary {
  constructor(expr = null) {
    super(expr);
  }
}
