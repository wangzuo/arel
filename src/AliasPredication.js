import As from './nodes/As';
import SqlLiteral from './nodes/SqlLiteral';

const AliasPredication = {
  as(other) {
    return new As(this, new SqlLiteral(other));
  }
};

export default AliasPredication;
