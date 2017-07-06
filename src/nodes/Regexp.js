import Binary from './Binary';

export default class Regexp extends Binary {
  constructor(left, right, caseSensitive = false) {
    super(left, right);
    this.caseSensitive = caseSensitive;
  }
}
