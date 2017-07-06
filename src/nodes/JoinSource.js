import _ from 'lodash';
import Binary from './Binary';

export default class JoinSource extends Binary {
  constructor(singleSource, joinop = []) {
    super(singleSource, joinop);
  }

  isEmpty() {
    return !this.left && _.isEmpty(this.right);
  }
}
