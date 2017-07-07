import babel from 'rollup-plugin-babel';

export default ['Arel', 'nodes', 'attributes', 'visitors'].map(x => ({
  entry: `src/${x}.js`,
  dest: `lib/${x}.js`,
  format: 'umd',
  plugins: [
    babel({
      runtimeHelpers: true
    })
  ],
  external: ['babel-runtime', 'lodash', 'object-hash']
}));
