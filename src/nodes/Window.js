import Node from './Node';
import Unary from './Unary';

class Window extends Node {
  constructor() {
    super();
    this.orders = [];
    this.partitions = [];
    this.framing = null;
  }

  order(...expr) {
    return this;
  }

  partition(...expr) {
    return this;
  }

  frame(expr) {
    this.framing = expr;
  }

  rows(expr = null) {
    if (this.framing) {
      return new Rows(expr);
    }
    return this.frame(new Row(expr));
  }

  range() {}

  hash() {}

  eql() {}
}

class NamedWindow extends Window {
  constructor(name) {
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

class CurrentRow extends Node {
  get hash() {}

  eql() {}
}

class Preceding extends Unary {
  constructor(expr = null) {
    super(expr);
  }
}

class Following extends Unary {
  constructor(expr = null) {
    super(expr);
  }
}

export default Window;
export { NamedWindow };
