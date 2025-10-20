// esbuild.build.js
import esbuild from 'esbuild';

async function build(entry, outfile) {
  await esbuild.build({ 
    entryPoints: [entry],
    outfile,
    bundle: true,
    sourcemap: true,
    platform: 'node',
    format: 'esm',
    target: ['node22'],
    sourcemap: true,
  });
  console.log(`Built ${outfile}`);
}

async function buildAll() {
  // await build('background/src/index.js', 'background/dist/index.js');
  // await build('devtools/src/index.js', 'devtools/dist/index.js');
  // await build('tools/src/login/index.js', 'tools/dist/login.js');

  await build('src/index.js', 'dist/index.js');
}

buildAll().catch(err => {
  console.error(err);
  process.exit(1);
});
