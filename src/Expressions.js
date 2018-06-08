// @flow
const Expressions = {
  count(distinct: boolean = false) {
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

  extract(field: string) {
    const { Extract } = require('./nodes');
    return new Extract([this], field);
  }
};

export default Expressions;
