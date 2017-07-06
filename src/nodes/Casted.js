import Node from './Node';
import Unary from './Unary';

export class Quoted extends Unary {}

export default class Casted extends Node {
  constructor(val, attribute) {
    super();
    this.val = val;
    this.attribute = attribute;
  }
}
