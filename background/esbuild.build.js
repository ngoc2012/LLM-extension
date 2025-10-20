// esbuild.build.js
import esbuild from 'esbuild';

esbuild.build({
  entryPoints: ['src/index.js'],
  outfile: 'dist/index.js',
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: ['node22'],
  sourcemap: true,
});

console.log(`Built /background/dist/index.js`);