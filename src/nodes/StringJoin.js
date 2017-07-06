import { Join } from './Binary';

export default class StringJoin extends Join {
  constructor(left, right = null) {
    super(left, right);
  }
}
