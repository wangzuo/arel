const AliasPredication = {
  as(other) {
    const { As } = require('./nodes');
    const { SqlLiteral } = require('./nodes');

    return new As(this, new SqlLiteral(other));
  }
};

export default AliasPredication;
