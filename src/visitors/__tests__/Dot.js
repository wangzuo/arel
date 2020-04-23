import * as Arel from '../../Arel';
import Dot from '../Dot';

const visitor = new Dot();

test('Nodes.BindParam', () => {
  const node = new Arel.nodes.BindParam();
});
