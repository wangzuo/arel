import hash from '../hash';

test('object', () => {
  expect(hash({ a: 1 })).toEqual(hash({ a: 1 }));
  expect(hash({ a: 1 })).not.toEqual(hash({ a: 2 }));
  expect(hash({ a: 1, b: 2 })).toEqual(hash({ b: 2, a: 1 }));
});

test('array', () => {
  expect(hash([1, 2])).toEqual(hash([1, 2]));
  expect(hash([1, 2])).not.toEqual(hash([2, 1]));
});

test('mixed', () => {
  expect(hash([1, { a: 1, b: 2 }])).toEqual(hash([1, { b: 2, a: 1 }]));
  expect(hash([1, { a: 1 }])).not.toEqual(hash([1, { a: 2 }]));
  expect(hash({ a: 1, b: [1, 2] })).toEqual(hash({ b: [1, 2], a: 1 }));
  expect(hash({ a: 1, b: [2, 1] })).not.toEqual(hash({ a: 1, b: [1, 2] }));
});

test('values', () => {
  expect(hash(1)).toEqual(hash(1));
  expect(hash('1')).toEqual(hash('1'));
});
