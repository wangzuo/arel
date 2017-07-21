import { Attribute } from './attributes';
import Node from './nodes/Node';
import BindParam from './nodes/BindParam';
import Casted, { Quoted } from './nodes/Casted';
import Unary from './nodes/Unary';
import Binary from './nodes/Binary';
import Func from './nodes/Func';

export const buildQuoted = (other, attribute = null) => {
  const { Attribute } = require('./attributes');
  const { Table, SelectManager } = require('./Arel');

  if (
    other &&
    other.constructor &&
    [Node, Attribute, Table, BindParam, SelectManager, Quoted].indexOf(
      other.constructor
    ) >= 0
  ) {
    return other;
  }

  if (attribute instanceof Attribute) {
    return new Casted(other, attribute);
  }

  return new Quoted(other);
};

export Node from './nodes/Node';
export SelectStatement from './nodes/SelectStatement';
export InsertStatement from './nodes/InsertStatement';
export SelectCore from './nodes/SelectCore';
export SqlLiteral from './nodes/SqlLiteral';
export Window, {
  NamedWindow,
  Preceding,
  Following,
  CurrentRow
} from './nodes/Window';
export Grouping from './nodes/Grouping';
export And from './nodes/And';
export NamedFunc from './nodes/NamedFunc';
export Equality from './nodes/Equality';
export DeleteStatement from './nodes/DeleteStatement';
export UpdateStatement from './nodes/UpdateStatement';
export BindParam from './nodes/BindParam';
export Casted, { Quoted } from './nodes/Casted';
export Values from './nodes/Values';
export ValuesList from './nodes/ValuesList';
export In from './nodes/In';
export UnqualifiedColumn from './nodes/UnqualifiedColumn';
export JoinSource from './nodes/JoinSource';
export TableAlias from './nodes/TableAlias';
export Count from './nodes/Count';
export InfixOperation, {
  Multiplication,
  Division,
  Addition,
  Subtraction,
  Concat,
  BitwiseAnd,
  BitwiseOr,
  BitwiseXor,
  BitwiseShiftLeft,
  BitwiseShiftRight
} from './nodes/InfixOperation';
export Matches, { DoesNotMatch } from './nodes/Matches';
export Regexp, { NotRegexp } from './nodes/Regexp';
export True from './nodes/True';
export False from './nodes/False';
export Extract from './nodes/Extract';

export class Distinct extends Node {
  hash() {}
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

export As from './nodes/As';
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

export class StringJoin extends Join {
  constructor(left, right = null) {
    super(left, right);
  }
}

export class InnerJoin extends Join {}
export class FullOuterJoin extends Join {}
export class OuterJoin extends Join {}
export class RightOuterJoin extends Join {}

export class Sum extends Func {}
export class Exists extends Func {}
export class Max extends Func {}
export class Min extends Func {}
export class Avg extends Func {}

export class With extends Unary {
  get children() {
    return this.expr;
  }
}

export class WithRecursive extends With {}

export class Ascending extends Ordering {
  reverse() {}

  get direction() {
    return 'asc';
  }
}

export class Descending extends Ordering {
  reverse() {}

  get direction() {
    return 'desc';
  }
}
