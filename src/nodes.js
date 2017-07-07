import Node from './nodes/Node';
import BindParam from './nodes/BindParam';
import Casted, { Quoted } from './nodes/Casted';
import { Attribute } from './attributes';

const Nodes = {
  buildQuoted(other, attribute = null) {
    const { Attribute } = require('./attributes');
    const { Table, SelectManager } = require('./Arel');

    if (
      [Node, Attribute, Table, BindParam, SelectManager, Quoted].indexOf(
        other.constructor
      ) >= 0
    ) {
      return other;
    } else {
      if (attribute instanceof Attribute) {
        return new Casted(other, attribute);
      }

      return new Quoted(other);
    }
  }
};

export default Nodes;
export Node from './nodes/Node';
export SelectStatement from './nodes/SelectStatement';
export InsertStatement from './nodes/InsertStatement';
export SqlLiteral from './nodes/SqlLiteral';
export StringJoin from './nodes/StringJoin';
export InnerJoin from './nodes/InnerJoin';
export FullOuterJoin from './nodes/FullOuterJoin';
export OuterJoin from './nodes/OuterJoin';
export RightOuterJoin from './nodes/RightOuterJoin';
export Window, { NamedWindow } from './nodes/Window';
export Grouping from './nodes/Grouping';
export And from './nodes/And';
export NamedFunction from './nodes/NamedFunction';
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
export {
  Bin,
  Cube,
  DistinctOn,
  Group,
  GroupingElement,
  GroupingSet,
  Limit,
  Lock,
  Not,
  Offset,
  On,
  Ordering,
  RollUp,
  Top
} from './nodes/Unary';
export {
  As,
  Assignment,
  Between,
  GreaterThan,
  GreaterThanOrEqual,
  Join,
  LessThan,
  LessThanOrEqual,
  NotEqual,
  NotIn,
  Or,
  Union,
  UnionAll,
  Intersect,
  Except
} from './nodes/Binary';
