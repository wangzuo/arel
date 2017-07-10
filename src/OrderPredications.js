const OrderPredications = {
  asc() {
    const { Ascending } = require('./nodes');
    return new Ascending(this);
  },
  desc() {
    const { Descending } = require('./nodes');
    return new Descending(this);
  }
};

export default OrderPredications;
