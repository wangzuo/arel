// @flow
const Math = {
  add(other) {
    const { Addition } = require('./nodes');
    return new Addition(this, other);
  },

  sub(other) {
    const { Subtraction } = require('./nodes');
    return new Subtraction(this, other);
  },

  multiple(other) {
    const { Multiplication } = require('./nodes');
    return new Multiplication(this, other);
  },

  divide(other) {
    const { Division } = require('./nodes');
    return new Division(this, other);
  },

  bitwiseAnd(other) {
    const { Grouping, BitwiseAnd } = require('./nodes');
    return new Grouping(new BitwiseAnd(this, other));
  },

  bitwiseOr(other) {
    const { Grouping, BitwiseOr } = require('./nodes');
    return new Grouping(new BitwiseOr(this, other));
  },

  bitwiseXor(other) {
    const { Grouping, BitwiseXor } = require('./nodes');
    return new Grouping(new BitwiseXor(this, other));
  },

  bitwiseShiftLeft(other) {
    const { Grouping, BitwiseShiftLeft } = require('./nodes');
    return new Grouping(new BitwiseShiftLeft(this, other));
  },

  bitwiseShiftRight(other) {
    const { Grouping, BitwiseShiftRight } = require('./nodes');
    return new Grouping(new BitwiseShiftRight(this, other));
  },

  bitwiseNot(other) {
    const { Grouping, BitwiseNot } = require('./nodes');
    return new Grouping(new BitwiseNot(this, other));
  }
};

export default Math;
