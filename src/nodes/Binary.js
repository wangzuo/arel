import hash from 'object-hash';
import Node from './Node';

class Binary extends Node {
  constructor(left, right) {
    super();
    this.left = left;
    this.right = right;
  }

  get hash() {
    return hash([this.constructor, this.left, this.right]);
  }

  eql() {}
}

export class As extends Binary {}
export class Assignment extends Binary {}
export class Between extends Binary {}
export class GreaterThan extends Binary {}
export class GreaterThanOrEqual extends Binary {}
export class Join extends Binary {}
export class LessThan extends Binary {}
export class LessThanOrEqual extends Binary {}
export class NotEqual extends Binary {}
export class NotIn extends Binary {}
export class Or extends Binary {}
export class Union extends Binary {}
export class UnionAll extends Binary {}
export class Intersect extends Binary {}
export class Except extends Binary {}
export default Binary;
