import isArray from 'lodash/isArray';

const Predications = {
  notEq(other) {
    const { NotEqual } = require('./nodes');
    return new NotEqual(this, this.quotedNode(other));
  },

  notEqAny(others) {
    return this.groupingAny('not_eq', others);
  },

  notEqAll(others) {
    return this.groupingAll('not_eq', others);
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

  inAny(others) {},
  inAll(others) {},

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

  notInAny(others) {},
  notInAll(others) {},

  matches(other, escape = null, caseSensitive = false) {
    const { Matches } = require('./nodes');
    return new Matches(this, this.quotedNode(other), escape, caseSensitive);
  },

  matchesRegexp(other, caseSensitive = true) {
    const { Regexp } = require('./nodes');
    return new Regexp(this, this.quotedNode(other), caseSensitive);
  },

  matchesAny(others, escape = null, caseSensitive = false) {},
  matchesAll(others, escape = null, caseSensitive = false) {},

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

  doesNotMatchAny(others, escape = null) {},
  doesNotMatchAll(others, escape = null) {},

  gteq(right) {
    const { GreaterThanOrEqual } = require('./nodes');
    return new GreaterThanOrEqual(this, this.quotedNode(right));
  },

  gteqAny(others) {},
  gteqAll(others) {},

  gt(right) {
    const { GreaterThan } = require('./nodes');
    return new GreaterThan(this, this.quotedNode(right));
  },

  gtAny(others) {},
  gtAll(others) {},

  lt(right) {
    const { LessThan } = require('./nodes');
    return new LessThan(this, this.quotedNode(right));
  },

  ltAny(others) {},
  ltAll(others) {},

  lteq(right) {
    const { LessThanOrEqual } = require('./nodes');
    return new LessThanOrEqual(this, this.quotedNode(right));
  },

  lteqAny(others) {},
  lteqAll(others) {},

  when(right) {
    const { Case } = require('./nodes');
    return new Case(this).when(this.quotedNode(right));
  },

  concat(other) {
    const { Concat } = require('./nodes');
    return new Concat(this, other);
  },

  // private

  groupingAny(methodId, others, ...extras) {},

  groupingAll(methodId, others, ...extras) {},

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
