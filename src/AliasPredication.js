const AliasPredication = {
  as(other) {
    const { As } = require('./nodes/Binary');
    const { default: SqlLiteral } = require('./nodes/SqlLiteral');

    return new As(this, new SqlLiteral(other));
  }
};

export default AliasPredication;
