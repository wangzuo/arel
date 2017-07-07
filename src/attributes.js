import Attribute, {
  String,
  Integer,
  Float,
  Decimal,
  Time,
  Boolean,
  Undefined
} from './attributes/Attribute';

export const forColumn = column => {
  const { type } = column;
  if (type === 'string' || type === 'text' || type === 'binary') {
    return String;
  } else if (type === 'integer') {
    return Integer;
  } else if (type === 'float') {
    return Float;
  } else if (type === 'decimal') {
    return Decimal;
  } else if (
    type === 'date' ||
    type === 'datetime' ||
    type === 'timestamp' ||
    type === 'time'
  ) {
    return Time;
  } else if (type === 'boolean') {
    return Boolean;
  }

  return Undefined;
};

export { Attribute, String, Integer, Float, Decimal, Time, Boolean, Undefined };
