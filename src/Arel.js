import { SqlLiteral } from './nodes';

export const sql = rawSql => new SqlLiteral(rawSql);
export const star = () => new SqlLiteral('*');
export Table from './Table';
export { Node } from './nodes';
export * as nodes from './nodes';
export * as attributes from './attributes';
export * as visitors from './visitors';
