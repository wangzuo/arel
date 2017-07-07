const WindowPredications = {
  over(expr = null) {
    const { Over } = require('./nodes');
    return new Over(this, expr);
  }
};

export default WindowPredications;
