// @flow
import isEmpty from 'lodash/isEmpty';
import Binary from './Binary';

export default class JoinSource extends Binary {
  constructor(singleSource, joinop = []) {
    super(singleSource, joinop);
  }

  isEmpty() {
    return !this.left && isEmpty(this.right);
  }
}
