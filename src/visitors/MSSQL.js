import isEmpty from 'lodash/isEmpty';
import ToSql from './ToSql';

class RowNumber {
  constructor(children) {
    this.children = children;
  }
}

export default class MSSQL extends ToSql {
  constructor(...args) {
    super(...args);
    this.primaryKeys = {};
  }

  // private

  visitTop(o) {
    return '';
  }

  visitRowNumber(o, collector) {
    collector.append('ROW_NUMBER() OVER (ORDER BY ');
    return this.injectJoin(o.children, collector, ', ').append(') as _row_num');
  }

  visitSelectStatement(o, collector) {
    if (!o.limit && !o.offset) {
      return super.visitSelectStatement(o, collector);
    }

    let isSelectCount = false;
    o.cores.forEach(x => {
      const coreOrderBy = this.rowNumLiteral(
        this.determineOrderBy(o.orders, x)
      );
      if (this.selectCount(x)) {
        x.projections = [coreOrderBy];
        isSelectCount = true;
      } else {
        x.projections.push(coreOrderBy);
      }
    });

    if (isSelectCount) {
      collector.append('SELECT COUNT(1) as count_id FROM (');
    }

    collector.append('SELECT _t.* FROM (');
    collector = o.cores.reduce((c, x) => this.visitSelectCore(x, c), collector);
    collector.append(`) as _t WHERE ${this.getOffsetLimitClause(o)}`);

    if (isSelectCount) {
      return collector.append(') AS subquery');
    }

    return collector;
  }

  getOffsetLimitClause(o) {
    const firstRow = o.offset ? o.offset.expr + 1 : 1;
    const lastRow = o.limit ? o.limit.expr - 1 + firstRow : null;

    if (lastRow) {
      return ` _row_num BETWEEN ${firstRow} AND ${lastRow}`;
    }
    return ` _row_num >= ${firstRow}`;
  }

  visitDeleteStatement(o, collector) {
    collector.append('DELETE ');

    if (o.limit) {
      collector.append('TOP (');
      this.visit(o.limit.expr, collector);
      collector.append(') ');
    }

    collector.append('FROM ');
    collector = this.visit(o.relation, collector);

    if (!isEmpty(o.wheres)) {
      collector.append(' WHERE ');
      return this.injectJoin(o.wheres, collector, ' AND ');
    }

    return collector;
  }

  determineOrderBy(orders, x) {
    if (!isEmpty(orders)) {
      return orders;
    } else if (!isEmpty(x.groups)) {
      return x.groups;
    }

    const pk = this.findLeftTablePk(x.froms);
    return pk ? [pk] : [];
  }

  rowNumLiteral(orderBy) {
    return new RowNumber(orderBy);
  }

  selectCount(x) {
    const { Count } = require('../nodes');
    return x.projections.length === 1 && x.projections[0] instanceof Count;
  }

  findLeftTablePk(o) {
    const { Table } = require('../Arel');
    const { Join } = require('../nodes');

    if (o instanceof Join) {
      return this.findLeftTablePk(o.left);
    } else if (o instanceof Table) {
      return this.findPrimaryKey(o);
    }
  }

  findPrimaryKey(o) {
    this.primaryKeys[o.name] =
      this.primaryKeys[o.name] ||
      do {
        const primaryKeyName = this.connection.primaryKey(o.name);
        primaryKeyName && o.column(primaryKeyName);
      };

    return this.primaryKeys[o.name];
  }
}
