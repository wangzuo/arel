const Predications = {
  notEq(other) {
    const { NotEqual } = require('./nodes/Binary');
    return new NotEqual(this, this.quotedNode(other));
  },

  notEqAny(others) {
    return this.groupingAny('not_eq', others);
  },

  notEqAll(others) {
    return this.groupingAll('not_eq', others);
  },

  eq(other) {
    const { default: Equality } = require('./nodes/Equality');
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
    const { default: Nodes } = require('./nodes');
    return Nodes.buildQuoted(other, this);
  },

  quotedArray(others) {
    return others.map(v => this.quotedNode(v));
  },

  equalsQuoted(maybeQuoted, value) {
    const { Quoted } = require('./nodes');
    if (maybeQuoted.instanceOf(Quoted)) {
      return maybeQuoted.val === value;
    }

    return maybeQuoted === value;
  }
};

export default Predications;
