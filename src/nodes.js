import SelectStatement from './nodes/SelectStatement';
import SqlLiteral from './nodes/SqlLiteral';
import StringJoin from './nodes/StringJoin';
import InnerJoin from './nodes/InnerJoin';
import FullOuterJoin from './nodes/FullOuterJoin';
import OuterJoin from './nodes/OuterJoin';
import RightOuterJoin from './nodes/RightOuterJoin';
import Window, { NamedWindow } from './nodes/Window';
import Grouping from './nodes/Grouping';
import And from './nodes/And';
import NamedFunction from './nodes/NamedFunction';
import {
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
import {
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
import DeleteStatement from './nodes/DeleteStatement';
import UpdateStatement from './nodes/UpdateStatement';
import BindParam from './nodes/BindParam';
import Casted, { Quoted } from './nodes/Casted';
import Values from './nodes/Values';
import ValuesList from './nodes/ValuesList';
import In from './nodes/In';
import UnqualifiedColumn from './nodes/UnqualifiedColumn';
import JoinSource from './nodes/JoinSource';
import TableAlias from './nodes/TableAlias';

export {
  And,
  NamedFunction,
  TableAlias,
  Grouping,
  JoinSource,
  SelectStatement,
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
  Except,
  UnqualifiedColumn,
  In,
  Values,
  ValuesList,
  BindParam,
  UpdateStatement,
  DeleteStatement,
  Window,
  NamedWindow,
  SqlLiteral,
  StringJoin,
  InnerJoin,
  FullOuterJoin,
  OuterJoin,
  RightOuterJoin,
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
};

const Nodes = {
  buildQuoted(other, attribute = null) {
    const { Attribute } = require('./attributes');
    const { Table, SelectManager } = require('./');

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
