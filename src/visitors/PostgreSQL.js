import isArray from 'lodash/isArray';
import ToSql from './ToSql';

const CUBE = 'CUBE';
const ROLLUP = 'ROLLUP';
const GROUPING_SET = 'GROUPING SET';

export default class PostgreSQL extends ToSql {
  // private

  visitMatches(o, collector) {
    const op = o.caseSensitive ? ' LIKE ' : ' ILIKE ';
    collector = this.infixValue(o, collector, op);
    if (o.escape) {
      collector.append(' ESCAPE ');
      return this.visit(o.escape, collector);
    }

    return collector;
  }

  visitDoesNotMatch(o, collector) {
    const op = o.caseSensitive ? ' NOT LIKE ' : ' NOT ILIKE ';
    collector = this.infixValue(o, collector, op);
    if (o.escape) {
      collector.append(' ESCAPE ');
      return this.visit(o.escape, collector);
    }
    return collector;
  }

  visitRegexp(o, collector) {
    const op = o.caseSensitive ? ' ~ ' : ' ~* ';
    return this.infixValue(o, collector, op);
  }

  visitNotRegexp(o, collector) {
    const op = o.caseSensitive ? ' !~ ' : ' !~* ';
    return this.infixValue(o, collector, op);
  }

  visitDistinctOn(o, collector) {
    collector.append('DISTINCT ON ( ');
    return this.visit(o.expr, collector).append(' )');
  }

  visitBindParam(o, collector) {
    return collector.addBind(o, i => `$${i}`);
  }

  visitGroupingElement(o, collector) {
    collector.append('( ');
    return this.visit(o.expr, collector).append(' )');
  }

  visitCube(o, collector) {
    collector.append(CUBE);
    return this.groupingArrayOrGroupingElement(o, collector);
  }

  visitRollUp(o, collector) {
    collector.append(ROLLUP);
    return this.groupingArrayOrGroupingElement(o, collector);
  }

  visitGroupingSet(o, collector) {
    collector.append(GROUPING_SET);
    return this.groupingArrayOrGroupingElement(o, collector);
  }

  groupingArrayOrGroupingElement(o, collector) {
    if (isArray(o.expr)) {
      collector.append('( ');
      this.visit(o.expr, collector);
      return collector.append(' )');
    }
    return this.visit(o.expr, collector);
  }
}
