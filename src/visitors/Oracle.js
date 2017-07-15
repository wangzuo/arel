import isNull from 'lodash/isNull';
import isEmpty from 'lodash/isEmpty';
import includes from 'lodash/includes';
import flatten from 'lodash/flatten';
import some from 'lodash/some';
import last from 'lodash/last';
import countBy from 'lodash/countBy';
import ToSql from './ToSql';
import SQLString from '../collectors/SQLString';

export default class Oracle extends ToSql {
  // private

  visitSelectStatement(o, collector) {
    o = this.orderHacks(o);

    if (
      o.limit &&
      isEmpty(o.orders) &&
      isEmpty(o.cores[0].groups) &&
      !o.offset &&
      !(
        o.cores[0].setQuantifier &&
        o.cores[0].setQuantifier.constructor.name.match(/Distinct/)
      )
    ) {
      const { LessThanOrEqual, SqlLiteral } = require('../nodes');
      last(o.cores).wheres.push(
        new LessThanOrEqual(new SqlLiteral('ROWNUM'), o.limit.expr)
      );
      return super.visitSelectStatement(o, collector);
    }

    if (o.limit && o.offset) {
      const limit = o.limit.expr;
      const offset = o.offset;
      o.offset = null;
      collector.append(
        `SELECT * FROM ( SELECT raw_sql_.*, rownum raw_rnum_ FROM (`
      );

      collector = super.visitSelectStatement(o, collector);

      const { BindParam } = require('../nodes');
      if (offset.expr instanceof BindParam) {
        let offsetBind = null;
        collector.append(`) raw_sql_ WHERE rownum <= (`);
        collector.addBind(offset.expr, i => {
          offsetBind = `:a${i}`;
          return offsetBind;
        });
        collector.append(' + ');
        collector.addBind(limit, i => `:a${i}`);
        collector.append(`) ) WHERE raw_rnum_ > ${offsetBind}`);
        return collector;
      } else {
        collector.append(
          `) raw_sql_ WHERE rownum <= ${offset.expr + limit} ) WHERE `
        );
        return this.visit(offset, collector);
      }
    }

    if (o.limit) {
      const limit = o.limit.expr;
      collector.append('SELECT * FROM (');
      collector = super.visitSelectStatement(o, collector);
      collector.append(') WHERE ROWNUM <= ');
      return this.visit(limit, collector);
    }

    if (o.offset) {
      const offset = o.offset;
      o.offset = null;
      collector.append(
        `SELECT * FROM ( SELECT raw_sql_.*, rownum raw_rnum_ FROM (`
      );
      collector = super.visitSelectStatement(o, collector);
      collector.append(`) raw_sql_ ) WHERE `);
      return this.visit(offset, collector);
    }

    return super.visitSelectStatement(o, collector);
  }

  visitLimit(o, collector) {
    return collector;
  }

  visitOffset(o, collector) {
    collector.append('raw_rnum_ > ');
    return this.visit(o.expr, collector);
  }

  visitExcept(o, collector) {
    collector.append('( ');
    collector = this.infixValue(o, collector, ' MINUS ');
    return collector.append(' )');
  }

  visitUpdateStatement(o, collector) {
    if (!isEmpty(o.orders) && isNull(o.limit)) {
      o.orders = [];
    }
    return super.visitUpdateStatement(o, collector);
  }

  orderHacks(o) {
    if (isEmpty(o.orders)) return o;

    if (
      !some(o.cores, core =>
        some(core.projections, projection =>
          projection.value.match(/FIRST_VALUE/)
        )
      )
    ) {
      return o;
    }

    const orders = flatten(
      o.orders.map(x => {
        const string = this.visit(x, new SQLString()).value;
        if (includes(string, ',')) {
          return this.splitOrderString(string);
        }
        return string;
      })
    );
    const { SqlLiteral } = require('../nodes');

    o.orders = [];
    orders.forEach((order, i) => {
      o.orders.push(
        new SqlLiteral(`alias_${i}__${order.match(/\bdesc$/i) ? ' DESC' : ''}`)
      );
    });

    return o;
  }

  splitOrderString(string) {
    const array = [];
    let i = 0;
    string.split(',').forEach(part => {
      if (array[i]) {
        array[i] += `, ${part}`;
      } else {
        array[i] = part;
      }
      if (
        countBy(array[i], x => x === '(').true ===
        countBy(array[i], x => x === ')').true
      ) {
        i += 1;
      }
    });

    return array;
  }

  visitBindParam(o, collector) {
    return collector.addBind(o, i => `:a${i}`);
  }
}
