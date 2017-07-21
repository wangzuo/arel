const Expressions = {
  count(distinct = false) {
    const { Count } = require('./nodes');
    return new Count([this], distinct);
  },

  sum() {
    const { Sum } = require('./nodes');
    return new Sum([this]);
  },

  maximum() {
    const { Max } = require('./nodes');
    return new Max([this]);
  },

  minimum() {
    const { Min } = require('./nodes');
    return new Min([this]);
  },

  average() {
    const { Avg } = require('./nodes');
    return new Avg([this]);
  },

  extract(field) {
    const { Extract } = require('./nodes');
    return new Extract([this], field);
  }
};

export default Expressions;
