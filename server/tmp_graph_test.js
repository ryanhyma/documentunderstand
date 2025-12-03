// Quick ESM test to ensure graphRunner exports the named runGraph
try {
  const mod = await import('./src/services/graphRunner.js');
  console.log('exports:', Object.keys(mod));
  console.log('runGraph type:', typeof mod.runGraph);
} catch (e) {
  console.error('Import error:', e && e.stack ? e.stack : e);
  process.exitCode = 2;
}
