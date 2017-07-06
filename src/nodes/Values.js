import Binary from './Binary';

export default class Values extends Binary {
  constructor(exprs, columns = []) {
    super(exprs, columns);
  }

  get expressions() {
    return this.left;
  }

  set expressions(val) {
    this.left = val;
  }

  get columns() {
    return this.right;
  }

  set columns(value) {
    this.right = value;
  }
}
