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
    const { In } = require('./nodes');
    const { SelectManager } = require('./Arel');

    if (other instanceof SelectManager) {
      return new In(this, other.ast);
    } // todo
  },

  inAny(others) {},
  inAll(others) {},

  notBetween(other) {},
  notIn(other) {},
  notInAny(others) {},
  notInAll(others) {},
  matches(other, escape = null, caseSensitive = false) {},
  matchesRegexp(other, caseSensitive = true) {},
  matchesAny(others, escape = null, caseSensitive = false) {},
  matchesAll(others, escape = null, caseSensitive = false) {},
  doesNotMatch(other, escape = null, caseSensitive = false) {},
  doesNotMatchRegexp(other, caseSensitive = true) {},
  doesNotMatchAny(others, escape = null) {},
  doesNotMatchAll(others, escape = null) {},
  gteq(right) {},
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

  lteq(right) {},
  lteqAny(others) {},
  lteqAll(others) {},

  when(right) {},

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
