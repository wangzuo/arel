const Expressions = {
  count(distinct = false) {
    const Count = require('./nodes/Count').default;
    return new Count([this], distinct);
  },

  sum() {
    const { Sum } = require('./nodes/Function');
    return new Sum([this]);
  },

  maximum() {
    const { Max } = require('./nodes/Function');
    return new Max([this]);
  },

  minimum() {
    const { Min } = require('./nodes/Function');
    return new Min([this]);
  },

  average() {
    const Avg = require('./nodes/Function');
    return new Avg([this]);
  },

  extract(field) {
    const Extract = require('./nodes/Extract').default;
    return new Extract([this]);
  }
};

export default Expressions;
