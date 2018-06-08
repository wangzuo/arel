// @flow
const Crud = {
  compileUpdate(values, pk) {
    const { SqlLiteral } = require('./nodes');
    const { default: UpdateManager } = require('./UpdateManager');
    const um = new UpdateManager();

    const relation =
      values instanceof SqlLiteral ? this.ctx.from : values[0][0].relation;

    um.key = pk;
    um.table(relation);
    um.set(values);
    if (this.ast.limit) {
      um.take(this.ast.limit.expr);
    }
    um.order(...this.ast.orders);
    um.wheres = this.ctx.wheres;
    return um;
  },

  compileInsert(values) {
    const im = this.createInsert();
    im.insert(values);
    return im;
  },

  createInsert() {
    const { default: InsertManager } = require('./InsertManager');
    return new InsertManager();
  },

  compileDelete() {
    const { default: DeleteManager } = require('./DeleteManager');
    const dm = new DeleteManager();
    if (this.ast.limit) {
      dm.take(this.ast.limit.expr);
    }
    dm.wheres = this.ctx.wheres;
    dm.from(this.ctx.froms);
    return dm;
  }
};

export default Crud;
