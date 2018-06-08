// @flow
import extend from 'lodash/extend';
import Binary from './Binary';

export default class Over extends Binary {
  constructor(left, right = null) {
    super(left, right);

    const { default: AliasPredication } = require('../AliasPredication');
    extend(this, AliasPredication);
  }

  get operator() {
    return 'OVER';
  }
}
