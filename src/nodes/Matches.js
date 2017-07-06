import Binary from './Binary';

export default class Matches extends Binary {
  constructor(left, right, escape = null, caseSensitive = false) {
    super(left, right);
    this.escape = escape && Nodes.buildQuoted(escape);
    this.caseSensitive = caseSensitive;
  }
}
