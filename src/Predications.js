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

  between(other) {},

  in(other) {},

  inAny(others) {},
  inAll(others) {},

  notBetween(other) {},
  notIn(other) {},
  notInAny(others) {},
  notInAll(others) {},
  matches(other, escape = null, caseSensitive = false) {},

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
