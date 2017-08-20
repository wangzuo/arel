import isArray from 'lodash/isArray';

const Predications = {
  notEq(other) {
    const { NotEqual } = require('./nodes');
    return new NotEqual(this, this.quotedNode(other));
  },

  notEqAny(others) {
    return this.groupingAny('notEq', others);
  },

  notEqAll(others) {
    return this.groupingAll('notEq', others);
  },

  eq(other) {
    const { Equality } = require('./nodes');
    return new Equality(this, this.quotedNode(other));
  },

  eqAny(others) {
    return this.groupingAny('eq', others);
  },

  eqAll(others) {
    return this.groupingAll('eq', this.quotedArray(others));
  },

  // TODO
  between(begin, end) {
    const { Between } = require('./nodes');
    const left = this.quotedNode(begin);
    const right = this.quotedNode(end);
    return new Between(this, left.and(right));
  },

  in(other) {
    const { SelectManager } = require('./Arel');
    const { In } = require('./nodes');

    if (other instanceof SelectManager) {
      return new In(this, other.ast);
    } else if (isArray(other)) {
      return new In(this, this.quotedArray(other));
    }

    return new In(this, this.quotedNode(other));
  },

  inAny(others) {
    return this.groupingAny('in', others);
  },

  inAll(others) {
    return this.groupingAll('in', others);
  },

  // TODO
  notBetween(other) {},

  notIn(other) {
    const { SelectManager } = require('./Arel');
    const { NotIn } = require('./nodes');
    if (other instanceof SelectManager) {
      return new NotIn(this, other.ast);
    } else if (isArray(other)) {
      return new NotIn(this, this.quotedArray(other));
    }

    return new NotIn(this, this.quotedNode(other));
  },

  notInAny(others) {
    return this.groupingAny('notIn', others);
  },

  notInAll(others) {
    return this.groupingAll('notIn', others);
  },

  matches(other, escape = null, caseSensitive = false) {
    const { Matches } = require('./nodes');
    return new Matches(this, this.quotedNode(other), escape, caseSensitive);
  },

  matchesRegexp(other, caseSensitive = true) {
    const { Regexp } = require('./nodes');
    return new Regexp(this, this.quotedNode(other), caseSensitive);
  },

  matchesAny(others, escape = null, caseSensitive = false) {
    return this.groupingAny('matches', others, escape, caseSensitive);
  },

  matchesAll(others, escape = null, caseSensitive = false) {
    return this.groupingAll('matches', others, escape, caseSensitive);
  },

  doesNotMatch(other, escape = null, caseSensitive = false) {
    const { DoesNotMatch } = require('./nodes');
    return new DoesNotMatch(
      this,
      this.quotedNode(other),
      escape,
      caseSensitive
    );
  },

  doesNotMatchRegexp(other, caseSensitive = true) {
    const { NotRegexp } = require('./nodes');
    return new NotRegexp(this, this.quotedNode(other), caseSensitive);
  },

  doesNotMatchAny(others, escape = null) {
    return this.groupingAny('doesNotMatch', others, escape);
  },

  doesNotMatchAll(others, escape = null) {
    return this.groupingAll('doesNotMatch', others, escape);
  },

  gteq(right) {
    const { GreaterThanOrEqual } = require('./nodes');
    return new GreaterThanOrEqual(this, this.quotedNode(right));
  },

  gteqAny(others) {
    return this.groupingAny('gteq', others);
  },

  gteqAll(others) {
    return this.groupingAll('gteq', others);
  },

  gt(right) {
    const { GreaterThan } = require('./nodes');
    return new GreaterThan(this, this.quotedNode(right));
  },

  gtAny(others) {
    return this.groupingAny('gt', others);
  },

  gtAll(others) {
    return this.groupingAll('gt', others);
  },

  lt(right) {
    const { LessThan } = require('./nodes');
    return new LessThan(this, this.quotedNode(right));
  },

  ltAny(others) {
    return this.groupingAny('lt', others);
  },

  ltAll(others) {
    return this.groupingAll('lt', others);
  },

  lteq(right) {
    const { LessThanOrEqual } = require('./nodes');
    return new LessThanOrEqual(this, this.quotedNode(right));
  },

  lteqAny(others) {
    return this.groupingAny('lteq', others);
  },

  lteqAll(others) {
    return this.groupingAll('lteq', others);
  },

  when(right) {
    const { Case } = require('./nodes');
    return new Case(this).when(this.quotedNode(right));
  },

  concat(other) {
    const { Concat } = require('./nodes');
    return new Concat(this, other);
  },

  // private

  groupingAny(methodId, others, ...extras) {
    const { Grouping, Or } = require('./nodes');
    const nodes = others.map(expr => this[methodId](expr, ...extras));
    return new Grouping(nodes.reduce((memo, node) => new Or(memo, node)));
  },

  groupingAll(methodId, others, ...extras) {
    const { Grouping, And } = require('./nodes');
    const nodes = others.map(expr => this[methodId](expr, ...extras));
    return new Grouping(new And(nodes));
  },

  quotedNode(other) {
    const { buildQuoted } = require('./nodes');
    return buildQuoted(other, this);
  },

  quotedArray(others) {
    return others.map(v => this.quotedNode(v));
  },

  equalsQuoted(maybeQuoted, value) {
    const { Quoted } = require('./nodes');
    if (maybeQuoted instanceof Quoted) {
      return maybeQuoted.val === value;
    }

    return maybeQuoted === value;
  }
};

export default Predications;
