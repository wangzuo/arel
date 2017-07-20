const AliasPredication = {
  as(other) {
    const { As, SqlLiteral } = require('./nodes');
    return new As(this, new SqlLiteral(other));
  }
};

export default AliasPredication;
