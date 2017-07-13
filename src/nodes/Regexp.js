import Binary from './Binary';

export default class Regexp extends Binary {
  constructor(left, right, caseSensitive = true) {
    super(left, right);
    this.caseSensitive = caseSensitive;
  }
}

export class NotRegexp extends Regexp {}
