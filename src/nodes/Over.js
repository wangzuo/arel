import Binary from './Binary';

export default class Over extends Binary {
  constructor(left, right = null) {
    super(left, right);
  }

  get operator() {
    return 'OVER';
  }
}
