const WindowPredications = {
  over(expr = null) {
    const { default: Over } = require('./nodes/Over');
    return new Over(this, expr);
  }
};

export default WindowPredications;
