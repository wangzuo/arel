// @flow
import Binary from './Binary';

export default class DeleteStatement extends Binary {
  constructor(relation = null, wheres = []) {
    super(relation, wheres);
  }

  get relation() {
    return this.left;
  }

  set relation(val) {
    this.left = val;
  }

  get wheres() {
    return this.right;
  }

  set wheres(val) {
    this.right = val;
  }
}
