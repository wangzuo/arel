import Binary from './Binary';

export default class Matches extends Binary {
  constructor(left, right, escape = null, caseSensitive = false) {
    const { buildQuoted } = require('../nodes');
    super(left, right);
    this.escape = escape && buildQuoted(escape);
    this.caseSensitive = caseSensitive;
  }
}

export class DoesNotMatch extends Matches {}
