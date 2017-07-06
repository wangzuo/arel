const FactoryMethods = {
  createTrue() {
    const { True } = require('./nodes');
    return new True();
  },

  createFalse() {
    const { False } = require('./nodes');
    return new False();
  },

  createTableAlias(relation, name) {
    const { TableAlias } = require('./nodes');
    return new TableAlias(relation, name);
  },

  createJoin(to, constraint = null, klass) {
    const { InnerJoin } = require('./nodes');
    klass = klass || InnerJoin;
    return new klass(to, constraint);
  },

  createStringJoin(to) {
    const { StringJoin } = require('./nodes');
    return this.createJoin(to, null, StringJoin);
  },

  createAnd(clauses) {
    const { And } = require('./nodes');
    return new And(clauses);
  },

  createOn(expr) {
    const { On } = require('./nodes');
    return new On(expr);
  },

  grouping(expr) {
    const { Grouping } = require('./nodes');
    return new Grouping(expr);
  },

  lower(column) {
    const { NamedFunction, default: Nodes } = require('./nodes');
    return new NamedFunction('LOWER', [Nodes.buildQuoted(column)]);
  }
};

export default FactoryMethods;
