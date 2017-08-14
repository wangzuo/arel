import trimEnd from 'lodash/trimEnd';
import isArray from 'lodash/isArray';
import isString from 'lodash/isString';
import isEmpty from 'lodash/isEmpty';
import forEach from 'lodash/forEach';
import isNull from 'lodash/isNull';
import Reduce from './Reduce';
import SQLString from '../collectors/SQLString';

export const WHERE = ' WHERE ';
export const SPACE = ' ';
export const COMMA = ', ';
export const GROUP_BY = ' GROUP BY ';
export const ORDER_BY = ' ORDER BY ';
export const WINDOW = ' WINDOW ';
export const AND = ' AND ';
export const DISTINCT = 'DISTINCT';

export default class ToSql extends Reduce {
  constructor(connection) {
    super();
    this.connection = connection;
  }

  compile(node, block) {
    return this.accept(node, new SQLString(), block).value;
  }

  // private

  visitDeleteStatement(o, collector) {
    collector.append('DELETE FROM ');
    collector = this.visit(o.relation, collector);

    if (o.wheres.length) {
      collector.append(WHERE);
      collector = this.injectJoin(o.wheres, collector, AND);
    }

    return this.maybeVisit(o.limit, collector);
  }

  buildSubselect(key, o) {
    const { SelectStatement } = require('../nodes');
    const stmt = new SelectStatement();
    const core = stmt.cores[0];
    core.froms = o.relation;
    core.wheres = o.wheres;
    core.projections = [key];
    stmt.limit = o.limit;
    stmt.orders = o.orders;
    return stmt;
  }

  visitUpdateStatement(o, collector) {
    const { In } = require('../nodes');
    const wheres =
      isEmpty(o.orders) && isNull(o.limit)
        ? o.wheres
        : [new In(o.key, [this.buildSubselect(o.key, o)])];

    collector.append('UPDATE ');
    collector = this.visit(o.relation, collector);
    if (!isEmpty(o.values)) {
      collector.append(' SET ');
      collector = this.injectJoin(o.values, collector, ', ');
    }

    if (!isEmpty(wheres)) {
      collector.append(' WHERE ');
      collector = this.injectJoin(wheres, collector, ' AND ');
    }

    return collector;
  }

  visitInsertStatement(o, collector) {
    collector.append('INSERT INTO ');
    collector = this.visit(o.relation, collector);

    if (o.columns && o.columns.length) {
      collector.append(
        ` (${o.columns.map(x => this.quoteColumnName(x.name)).join(', ')})`
      );
    }

    if (o.values) {
      return this.maybeVisit(o.values, collector);
    } else if (o.select) {
      return this.maybeVisit(o.select, collector);
    }

    return collector;
  }

  visitExists(o, collector) {
    collector.append('EXISTS (');
    collector = this.visit(o.expressions, collector).append(')');
    if (o.alias) {
      collector.append(' AS ');
      return this.visit(o.alias, collector);
    }
    return collector;
  }

  visitCasted(o, collector) {
    return collector.append(this.quoted(o.val, o.attribute).toString());
  }

  visitQuoted(o, collector) {
    return collector.append(this.quoted(o.expr, null).toString());
  }

  visitTrue(o, collector) {
    return collector.append('TRUE');
  }

  visitFalse(o, collector) {
    return collector.append('FALSE');
  }

  visitValuesList(o, collector) {
    const { SqlLiteral, BindParam } = require('../nodes');

    collector.append('VALUES ');
    const len = o.rows.length - 1;
    o.rows.forEach((row, i) => {
      collector.append('(');
      const rowLen = row.length - 1;

      forEach(row, (value, k) => {
        if (value instanceof SqlLiteral || value instanceof BindParam) {
          collector = this.visit(value, collector);
        } else {
          collector.append(this.quote(value));
        }
        if (k !== rowLen) {
          collector.append(COMMA);
        }
      });

      collector.append(')');
      if (i !== len) {
        collector.append(COMMA);
      }
    });

    return collector;
  }

  visitValues(o, collector) {
    const { SqlLiteral, BindParam } = require('../nodes');

    collector.append('VALUES (');
    const len = o.expressions.length - 1;
    o.expressions.forEach((value, i) => {
      if (value instanceof SqlLiteral || value instanceof BindParam) {
        collector = this.visit(value, collector);
      } else {
        collector.append(this.quote(value).toString());
      }

      if (i !== len) {
        collector.append(COMMA);
      }
    });

    return collector.append(')');
  }

  visitSelectStatement(o, collector) {
    if (o.with) {
      collector = this.visit(o.with, collector);
      collector.append(SPACE);
    }

    collector = o.cores.reduce((c, x) => this.visitSelectCore(x, c), collector);

    if (o.orders && o.orders.length) {
      collector.append(ORDER_BY);
      const len = o.orders.length - 1;
      o.orders.forEach((x, i) => {
        collector = this.visit(x, collector);
        if (len !== i) {
          collector.append(COMMA);
        }
      });
    }

    this.visitSelectOptions(o, collector);

    return collector;
  }

  visitSelectOptions(o, collector) {
    collector = this.maybeVisit(o.limit, collector);
    collector = this.maybeVisit(o.offset, collector);
    collector = this.maybeVisit(o.lock, collector);
    return collector;
  }

  visitSelectCore(o, collector) {
    collector.append('SELECT');
    collector = this.maybeVisit(o.top, collector);
    collector = this.maybeVisit(o.setQuantifier, collector);

    this.collectNodesFor(o.projections, collector, SPACE);

    if (o.source && !o.source.isEmpty()) {
      collector.append(' FROM ');
      collector = this.visit(o.source, collector);
    }

    this.collectNodesFor(o.wheres, collector, WHERE, AND);
    this.collectNodesFor(o.groups, collector, GROUP_BY);

    if (!isEmpty(o.havings)) {
      collector.append(' HAVING ');
      this.injectJoin(o.havings, collector, AND);
    }

    this.collectNodesFor(o.windows, collector, WINDOW);

    return collector;
  }

  collectNodesFor(nodes, collector, spacer, connector = COMMA) {
    if (nodes && nodes.length) {
      collector.append(spacer);
      const len = nodes.length - 1;
      nodes.forEach((x, i) => {
        collector = this.visit(x, collector);
        if (len !== i) {
          collector.append(connector);
        }
      });
    }
  }

  visitBin(o, collector) {
    return this.visit(o.expr, collector);
  }

  visitDistinct(o, collector) {
    return collector.append(DISTINCT);
  }

  visitDistinctOn(o, collector) {
    throw new Error('DISTINCT ON not implemented for this db');
  }

  visitWith(o, collector) {
    collector.append('WITH ');
    return this.injectJoin(o.children, collector, COMMA);
  }

  visitWithRecursive(o, collector) {
    collector.append('WITH RECURSIVE ');
    return this.injectJoin(o.children, collector, COMMA);
  }

  visitUnion(o, collector) {
    collector.append('( ');
    return this.infixValue(o, collector, ' UNION ').append(' )');
  }

  visitUnionAll(o, collector) {
    collector.append('( ');
    return this.infixValue(o, collector, ' UNION ALL ').append(' )');
  }

  visitIntersect(o, collector) {
    collector.append('( ');
    return this.infixValue(o, collector, ' INTERSECT ').append(' )');
  }

  visitExcept(o, collector) {
    collector.append('( ');
    return this.infixValue(o, collector, ' EXCEPT ').append(' )');
  }

  visitNamedWindow(o, collector) {
    collector.append(this.quoteColumnName(o.name));
    collector.append(' AS ');
    return this.visitWindow(o, collector);
  }

  visitWindow(o, collector) {
    collector.append('(');

    if (!isEmpty(o.partitions)) {
      collector.append('PARTITION BY ');
      collector = this.injectJoin(o.partitions, collector, ', ');
    }

    if (!isEmpty(o.orders)) {
      if (!isEmpty(o.partitions)) {
        collector.append(SPACE);
      }
      collector.append('ORDER BY ');
      collector = this.injectJoin(o.orders, collector, ', ');
    }

    if (o.framing) {
      if (!isEmpty(o.partitions) || !isEmpty(o.orders)) {
        collector.append(SPACE);
      }
      collector = this.visit(o.framing, collector);
    }

    return collector.append(')');
  }

  visitRows(o, collector) {
    if (o.expr) {
      collector.append('ROWS ');
      return this.visit(o.expr, collector);
    }

    return this.collector.append('ROWS');
  }

  visitRange(o, collector) {
    if (o.expr) {
      collector.append('RANGE ');
      return this.visit(o.expr, collector);
    }

    return collector.append('RANGE');
  }

  visitPreceding(o, collector) {
    if (o.expr) {
      return this.visit(o.expr, collector).append(' PRECEDING');
    }

    return collector.append('UNBOUNDED PRECEDING');
  }

  visitFollowing(o, collector) {
    if (o.expr) {
      return this.visit(o.expr, collector).append(' FOLLOWING');
    }

    return collector.append('UNBOUNDED FOLLOWING');
  }

  visitCurrentRow(o, collector) {
    return collector.append('CURRENT ROW');
  }

  visitOver(o, collector) {
    const { SqlLiteral } = require('../nodes');

    if (isNull(o.right)) {
      return this.visit(o.left, collector).append(' OVER ()');
    } else if (o.right instanceof SqlLiteral) {
      return this.infixValue(o, collector, ' OVER ');
    } else if (isString(o.right)) {
      return this.visit(o.left, collector).append(
        ` OVER ${this.quoteColumnName(o.right)}`
      );
    }

    return this.infixValue(o, collector, ' OVER ');
  }

  visitOffset(o, collector) {
    collector.append('OFFSET ');
    return this.visit(o.expr, collector);
  }

  visitLimit(o, collector) {
    collector.append('LIMIT ');
    return this.visit(o.expr, collector);
  }

  visitTop(o, collector) {
    return collector;
  }

  visitLock(o, collector) {
    return this.visit(o.expr, collector);
  }

  visitGrouping(o, collector) {
    const { Grouping } = require('../nodes');

    if (o.expr instanceof Grouping) {
      return this.visit(o.expr, collector);
    } else {
      collector.append('(');
      return this.visit(o.expr, collector).append(')');
    }
  }

  visitSelectManager(o, collector) {
    return collector.append(`(${trimEnd(o.toSql())})`);
  }

  visitAscending(o, collector) {
    return this.visit(o.expr, collector).append(' ASC');
  }

  visitDescending(o, collector) {
    return this.visit(o.expr, collector).append(' DESC');
  }

  visitGroup(o, collector) {
    return this.visit(o.expr, collector);
  }

  visitNamedFunc(o, collector) {
    collector.append(o.name);
    collector.append('(');
    if (o.distinct) {
      collector.append('DISTINCT ');
    }
    collector = this.injectJoin(o.expressions, collector, ', ').append(')');
    if (o.alias) {
      collector.append(' AS ');
      return this.visit(o.alias, collector);
    }

    return collector;
  }

  visitExtract(o, collector) {
    collector.append(`EXTRACT(${o.field.toUpperCase()} FROM `);
    return this.visit(o.expr, collector).append(')');
  }

  visitCount(o, collector) {
    return this.aggregate('COUNT', o, collector);
  }

  visitSum(o, collector) {
    return this.aggregate('SUM', o, collector);
  }

  visitMax(o, collector) {
    return this.aggregate('MAX', o, collector);
  }

  visitMin(o, collector) {
    return this.aggregate('MIN', o, collector);
  }

  visitAvg(o, collector) {
    return this.aggregate('AVG', o, collector);
  }

  visitTableAlias(o, collector) {
    collector = this.visit(o.relation, collector);
    collector.append(' ');
    return collector.append(this.quoteTableName(o.name));
  }

  visitBetween(o, collector) {
    collector = this.visit(o.left, collector);
    collector.append(' BETWEEN ');
    return this.visit(o.right, collector);
  }

  visitGreaterThanOrEqual(o, collector) {
    collector = this.visit(o.left, collector);
    collector.append(' >= ');
    return this.visit(o.right, collector);
  }

  visitGreaterThan(o, collector) {
    collector = this.visit(o.left, collector);
    collector.append(' > ');
    return this.visit(o.right, collector);
  }

  visitLessThanOrEqual(o, collector) {
    collector = this.visit(o.left, collector);
    collector.append(' <= ');
    return this.visit(o.right, collector);
  }

  visitLessThan(o, collector) {
    collector = this.visit(o.left, collector);
    collector.append(' < ');
    return this.visit(o.right, collector);
  }

  visitMatches(o, collector) {
    collector = this.visit(o.left, collector);
    collector.append(' LIKE ');
    collector = this.visit(o.right, collector);
    if (o.escape) {
      collector.append(' ESCAPE ');
      return this.visit(o.escape, collector);
    }

    return collector;
  }

  visitDoesNotMatch(o, collector) {
    collector = this.visit(o.left, collector);
    collector.append(' NOT LIKE ');
    collector = this.visit(o.right, collector);
    if (o.escape) {
      collector.append(' ESCAPE ');
      return this.visit(o.escape, collector);
    }

    return collector;
  }

  visitJoinSource(o, collector) {
    if (o.left) {
      collector = this.visit(o.left, collector);
    }

    if (!isEmpty(o.right)) {
      if (o.left) {
        collector.append(SPACE);
      }
      collector = this.injectJoin(o.right, collector, SPACE);
    }

    return collector;
  }

  visitRegexp(o, collector) {
    throw new Error('~ not implemented for this db');
  }

  visitNotRegexp(o, collector) {
    throw new Error('!~ not implemented for this db');
  }

  visitStringJoin(o, collector) {
    return this.visit(o.left, collector);
  }

  visitFullOuterJoin(o, collector) {
    collector.append('FULL OUTER JOIN ');
    collector = this.visit(o.left, collector);
    collector.append(SPACE);
    return this.visit(o.right, collector);
  }

  visitOuterJoin(o, collector) {
    collector.append('LEFT OUTER JOIN ');
    collector = this.visit(o.left, collector);
    collector.append(' ');
    return this.visit(o.right, collector);
  }

  visitRightOuterJoin(o, collector) {
    collector.append('RIGHT OUTER JOIN ');
    collector = this.visit(o.left, collector);
    collector.append(SPACE);
    return this.visit(o.right, collector);
  }

  visitInnerJoin(o, collector) {
    collector.append('INNER JOIN ');
    collector = this.visit(o.left, collector);
    if (o.right) {
      collector.append(SPACE);
      this.visit(o.right, collector);
    }

    return collector;
  }

  visitOn(o, collector) {
    collector.append('ON ');
    return this.visit(o.expr, collector);
  }

  visitNot(o, collector) {
    collector.append('NOT (');
    return this.visit(o.expr, collector).append(')');
  }

  visitTable(o, collector) {
    if (o.tableAlias) {
      return collector.append(
        `${this.quoteTableName(o.name)} ${this.quoteTableName(o.tableAlias)}`
      );
    }

    return collector.append(this.quoteTableName(o.name));
  }

  visitIn(o, collector) {
    if (isArray(o.right) && isEmpty(o.right)) {
      collector.append('1=0');
    } else {
      collector = this.visit(o.left, collector);
      collector.append(' IN (');
      this.visit(o.right, collector).append(')');
    }

    return collector;
  }

  visitNotIn(o, collector) {
    if (isArray(o.right) && isEmpty(o.right)) {
      return collector.append('1=1');
    }

    collector = this.visit(o.left, collector);
    collector.append(' NOT IN (');
    collector = this.visit(o.right, collector);
    return collector.append(')');
  }

  visitAnd(o, collector) {
    return this.injectJoin(o.children, collector, ' AND ');
  }

  visitOr(o, collector) {
    collector = this.visit(o.left, collector);
    collector.append(' OR ');
    return this.visit(o.right, collector);
  }

  visitAssignment(o, collector) {
    const { UnqualifiedColumn, BindParam } = require('../nodes');
    const { Attribute } = require('../attributes');

    if (
      o.right instanceof UnqualifiedColumn ||
      o.right instanceof Attribute ||
      o.right instanceof BindParam
    ) {
      collector = this.visit(o.left, collector);
      collector.append(' = ');
      return this.visit(o.right, collector);
    } else {
      collector = this.visit(o.left, collector);
      collector.append(' = ');
      collector.append(this.quote(o.right).toString());
    }

    return collector;
  }

  visitEquality(o, collector) {
    const right = o.right;
    collector = this.visit(o.left, collector);

    // todo
    if (isNull(right) || (right.isNull && right.isNull())) {
      collector.append(' IS NULL');
    } else {
      collector.append(' = ');
      this.visit(right, collector);
    }

    return collector;
  }

  visitNotEqual(o, collector) {
    const right = o.right;
    collector = this.visit(o.left, collector);

    // todo
    if (isNull(right) || (right.isNull && right.isNull())) {
      return collector.append(' IS NOT NULL');
    }

    collector.append(' != ');
    return this.visit(right, collector);
  }

  visitAs(o, collector) {
    collector = this.visit(o.left, collector);
    collector.append(' AS ');
    return this.visit(o.right, collector);
  }

  visitCase(o, collector) {
    collector.append('CASE ');
    if (o.case) {
      this.visit(o.case, collector);
      collector.append(' ');
    }

    o.conditions.forEach(condition => {
      this.visit(condition, collector);
      collector.append(' ');
    });

    if (o.default) {
      this.visit(o.default, collector);
      collector.append(' ');
    }

    return collector.append('END');
  }

  visitWhen(o, collector) {
    collector.append('WHEN ');
    this.visit(o.left, collector);
    collector.append(' THEN ');
    return this.visit(o.right, collector);
  }

  visitElse(o, collector) {
    collector.append('ELSE ');
    return this.visit(o.expr, collector);
  }

  visitUnqualifiedColumn(o, collector) {
    collector.append(this.quoteColumnName(o.name));
    return collector;
  }

  visitAttribute(o, collector) {
    const joinName = o.relation.tableAlias || o.relation.name;
    return collector.append(
      `${this.quoteTableName(joinName)}.${this.quoteColumnName(o.name)}`
    );
  }

  // alias
  visitInteger(...args) {
    return this.visitAttribute(...args);
  }

  visitFloat(...args) {
    return this.visitAttribute(...args);
  }

  visitDecimal(...args) {
    return this.visitAttribute(...args);
  }

  visitString(...args) {
    return this.visitAttribute(...args);
  }

  visitTime(...args) {
    return this.visitAttribute(...args);
  }

  visitBoolean(...args) {
    return this.visitAttribute(...args);
  }

  literal(o, collector) {
    return collector.append(o.toString());
  }

  visitNumber(o, collector) {
    return this.literal(o, collector);
  }

  visitBindParam(o, collector) {
    return collector.addBind(o, () => '?');
  }

  // alias
  visitSqlLiteral(o, collector) {
    return this.literal(o, collector);
  }

  // todo
  // visitBignum
  // visitFixnum
  // visitInteger

  quoted(o, a) {
    if (a && a.ableToTypeCast()) {
      return this.quote(a.typeCastForDatabase(o));
    } else {
      return this.quote(o);
    }
  }

  // todo
  unsupported(o, collector) {
    throw new Error('unsupported visit error');
  }

  visitInfixOperation(o, collector) {
    collector = this.visit(o.left, collector);
    collector.append(` ${o.operator} `);
    return this.visit(o.right, collector);
  }

  // alias
  visitAddition(...args) {
    return this.visitInfixOperation(...args);
  }

  visitSubtraction(...args) {
    return this.visitInfixOperation(...args);
  }

  visitMultiplication(...args) {
    return this.visitInfixOperation(...args);
  }

  visitDivision(...args) {
    return this.visitInfixOperation(...args);
  }

  visitConcat(...args) {
    return this.visitInfixOperation(...args);
  }

  visitBitwiseAnd(...args) {
    return this.visitInfixOperation(...args);
  }

  visitBitwiseOr(...args) {
    return this.visitInfixOperation(...args);
  }

  visitBitwiseXor(...args) {
    return this.visitInfixOperation(...args);
  }

  visitBitwiseShiftLeft(...args) {
    return this.visitInfixOperation(...args);
  }

  visitBitwiseShiftRight(...args) {
    return this.visitInfixOperation(...args);
  }

  visitUnaryOperation(o, collector) {
    collector.append(` ${o.operator} `);
    return this.visit(o.expr, collector);
  }

  visitArray(o, collector) {
    return this.injectJoin(o, collector, ', ');
  }

  // visitSet

  quote(value) {
    const { SqlLiteral } = require('../nodes');
    if (value instanceof SqlLiteral) return value;
    return this.connection.quote(value);
  }

  quoteTableName(name) {
    const { SqlLiteral } = require('../nodes');
    if (name instanceof SqlLiteral) return name;
    return this.connection.quoteTableName(name);
  }

  quoteColumnName(name) {
    const { SqlLiteral } = require('../nodes');
    if (name instanceof SqlLiteral) return name;
    return this.connection.quoteColumnName(name);
  }

  maybeVisit(thing, collector) {
    if (!thing) return collector;
    collector.append(' ');
    return this.visit(thing, collector);
  }

  injectJoin(list, collector, joinStr) {
    const len = list.length - 1;
    return list.map((x, i) => [x, i]).reduce((c, [x, i]) => {
      if (i === len) {
        return this.visit(x, c);
      } else {
        return this.visit(x, c).append(joinStr);
      }
    }, collector);
  }

  infixValue(o, collector, value) {
    collector = this.visit(o.left, collector);
    collector.append(value);
    return this.visit(o.right, collector);
  }

  aggregate(name, o, collector) {
    collector.append(`${name}(`);
    if (o.distinct) {
      collector.append('DISTINCT ');
    }

    collector = this.injectJoin(o.expressions, collector, ', ').append(')');

    if (o.alias) {
      collector.append(' AS ');
      return this.visit(o.alias, collector);
    }

    return collector;
  }
}
