import Node from './Node';

class Unary extends Node {
  constructor(expr) {
    super();
    this.expr = expr;
  }

  get hash() {
    return this.expr.hash;
  }

  eql() {}
}

export class Bin extends Unary {}
export class Cube extends Unary {}
export class DistinctOn extends Unary {}
export class Group extends Unary {}
export class GroupingElement extends Unary {}
export class GroupingSet extends Unary {}
export class Limit extends Unary {}
export class Lock extends Unary {}
export class Not extends Unary {}
export class Offset extends Unary {}
export class On extends Unary {}
export class Ordering extends Unary {}
export class RollUp extends Unary {}
export class Top extends Unary {}

export default Unary;
