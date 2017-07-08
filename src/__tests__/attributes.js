import _ from 'lodash';
import { Table } from '../Arel';
import * as Attributes from '../attributes';

const {
  Attribute,
  Undefined,
  String,
  Integer,
  Float,
  Decimal,
  Boolean,
  Time
} = Attributes;

class Column {
  constructor(type) {
    this.type = type;
  }
}

describe('attributes', () => {
  it('responds to lower', () => {
    const relation = new Table('users');
    const attribute = relation.column('foo');
    const node = attribute.lower();
    expect(node.name).toBe('LOWER');
    expect(node.expressions).toEqual([attribute]);
  });

  // describe('equality', () => {
  //   it('is equal with equal ivars', () => {
  //     const array = [new Attribute('foo', 'bar'), new Attribute('foo', 'bar')];
  //     expect(_.uniq(array.size)).toBe(1);
  //   });

  //   it('is not equal with different ivars', () => {
  //     const array = [new Attribute('foo', 'bar'), new Attribute('foo', 'baz')];
  //     expect(_.uniq(array.size)).toBe(2);
  //   });
  // });

  describe('for', () => {
    it('deals with unknown column types', () => {
      const column = new Column('crazy');

      expect(Attributes.forColumn(column)).toBe(Undefined);
    });

    it('returns the correct constant for strings', () => {
      ['string', 'text', 'binary'].forEach(type => {
        const column = new Column(type);
        expect(Attributes.forColumn(column)).toBe(String);
      });
    });

    it('returns the correct constant for ints', () => {
      const column = new Column('integer');
      expect(Attributes.forColumn(column)).toBe(Integer);
    });

    it('returns the correct constant for floats', () => {
      const column = new Column('float');
      expect(Attributes.forColumn(column)).toBe(Float);
    });

    it('returns the correct constant for decimals', () => {
      const column = new Column('decimal');
      expect(Attributes.forColumn(column)).toBe(Decimal);
    });

    it('returns the correct constant for boolean', () => {
      const column = new Column('boolean');
      expect(Attributes.forColumn(column)).toBe(Boolean);
    });

    it('returns the correct constant for time', () => {
      ['date', 'datetime', 'timestamp', 'time'].forEach(type => {
        const column = new Column(type);
        expect(Attributes.forColumn(column)).toBe(Time);
      });
    });
  });
});
