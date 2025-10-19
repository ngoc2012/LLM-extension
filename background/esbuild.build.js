// esbuild.build.js
import esbuild from 'esbuild';

async function build(entry, outfile) {
  await esbuild.build({ 
    entryPoints: [entry],
    bundle: true,
    format: 'iife',
    outfile,
    sourcemap: true,
  });
  console.log(`Built ${outfile}`);
}

async function buildAll() {
  // await build('background/src/index.js', 'background/dist/index.js');
  // await build('devtools/src/index.js', 'devtools/dist/index.js');
  // await build('tools/src/login/index.js', 'tools/dist/login.js');

  esbuild.build({
    entryPoints: ['src/index.js'],
    bundle: true,
    outfile: 'dist/index.js',
    platform: 'node',
    format: 'esm',
    // external: ['pg', 'events', /* other dynamic deps */],
    // banner: { js: REQUIRE_SHIM },
    target: ['node18'],
  });
  console.log(`Built server/dist/index.js`);

}

buildAll().catch(err => {
  console.error(err);
  process.exit(1);
});
