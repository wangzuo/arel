// @flow
import isString from 'lodash/isString';
import As from './nodes/As';
import SqlLiteral from './nodes/SqlLiteral';

const AliasPredication = {
  as(other) {
    if (isString(other)) {
      return new As(this, new SqlLiteral(other));
    }
    return new As(this, other);
  }
};

export default AliasPredication;
