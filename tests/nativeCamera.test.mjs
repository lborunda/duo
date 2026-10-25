import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';

const source = await readFile(new URL('../services/nativeCamera.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } }).outputText;
const { watchNativeCamera, captureNativePhoto, openNativeSetup, stopNativeCamera } = await import('data:text/javascript;base64,' + Buffer.from(compiled).toString('base64'));
const settle = () => new Promise(resolve => setTimeout(resolve, 25));
const status = state => Response.json({ state, detail: state === 'error' ? 'Glasses disconnected' : state });
const frame = () => new Response(new Uint8Array([255,216,255]), { headers: { 'Content-Type': 'image/jpeg' } });

test('explicit Stop requests native hardware shutdown and reports failures', async () => {
  const calls = [];
  await stopNativeCamera('/shared/', async (url, options) => {
    calls.push([url, options.method, options.cache]);
    return new Response(null, { status: 200 });
  });
  assert.deepEqual(calls, [['/shared/stop', 'POST', 'no-store']]);
  await assert.rejects(stopNativeCamera('/shared/', async () => new Response(null, { status: 503 })), /Could not stop/);
});

test('stopped hardware clears preview and polling never restarts it', async () => {
  let state = 'live';
  const calls = [], frames = [], states = [];
  const unsubscribe = watchNativeCamera('/shared/', value => states.push(value), value => frames.push(value), async url => {
    calls.push(url);
    return url.endsWith('status') ? status(state) : frame();
  }, { createObjectURL: () => 'blob:live', revokeObjectURL: () => {} });
  try {
    await settle();
    assert.equal(frames.at(-1), 'blob:live');
    state = 'stopped';
    await new Promise(resolve => setTimeout(resolve, 350));
    assert.equal(frames.at(-1), null);
    assert.equal(states.at(-1).state, 'stopped');
    assert.equal(calls.filter(url => url.endsWith('frame')).length, 1);
    assert.ok(calls.every(url => url.endsWith('status') || url.endsWith('frame')));
  } finally { unsubscribe(); }
});

test('preview shares frames, clears disconnects and releases image URLs', async () => {
  let state = 'live', current = null;
  const calls = [], revoked = [], states = [];
  const stop = watchNativeCamera('/local/', value => states.push(value), url => { current = url; }, async url => {
    calls.push(url);
    return url.endsWith('status') ? status(state) : frame();
  }, { createObjectURL: () => 'blob:frame', revokeObjectURL: url => revoked.push(url) });
  try {
    await settle();
    assert.equal(current, 'blob:frame');
    assert.deepEqual(calls, ['/local/status', '/local/frame']);
    state = 'error';
    await new Promise(resolve => setTimeout(resolve, 180));
    assert.equal(current, null);
    assert.ok(revoked.includes('blob:frame'));
    assert.equal(states.at(-1).detail, 'Glasses disconnected');
    assert.equal(calls.filter(url => url.endsWith('frame')).length, 1);
  } finally { stop(); }
});

test('stop aborts pending IO and suppresses late frames', async () => {
  let finish, signal;
  const frames = [], states = [];
  const stop = watchNativeCamera('/local/', value => states.push(value), value => frames.push(value), (_url, options) => {
    signal = options.signal;
    return new Promise(resolve => { finish = resolve; });
  });
  stop();
  finish(status('live'));
  await settle();
  assert.equal(signal.aborted, true);
  assert.deepEqual(frames, [null]);
  assert.deepEqual(states, []);
});

test('missing or failed frames never display a live image', async () => {
  for (const response of [new Response(null, { status: 204 }), new Response('error', { status: 503 }), new Response('<html>')]) {
    const frames = [], states = [];
    const stop = watchNativeCamera('/local/', value => states.push(value), value => frames.push(value),
      async url => url.endsWith('status') ? status('live') : response);
    try {
      await settle();
      assert.equal(frames.at(-1), null);
      if (response.status !== 204) assert.equal(states.at(-1).state, 'error');
    } finally { stop(); }
  }
});

test('capture uses POST and never falls back when the glasses refuse', async () => {
  const calls = [];
  await assert.rejects(captureNativePhoto('/local/', async (url, options) => {
    calls.push([url, options.method]);
    return new Response('Glasses disconnected', { status: 503 });
  }), /Glasses disconnected/);
  assert.deepEqual(calls, [['/local/capture', 'POST']]);
  await assert.rejects(captureNativePhoto('/local/', async () => new Response('<html>')), /Expected a photograph/);
});

test('setup opens through the same protected native bridge', async () => {
  const calls = [];
  await openNativeSetup('/shared/', async (url, options) => {
    calls.push([url, options.method, options.cache]);
    return new Response(null, { status: 202 });
  });
  assert.deepEqual(calls, [['/shared/setup', 'POST', 'no-store']]);
  await assert.rejects(openNativeSetup('/shared/', async () => new Response(null, { status: 403 })), /Could not open glasses setup/);
});

test('setup diagnostics are forwarded without opening another camera', async () => {
  const calls = [], states = [];
  const stop = watchNativeCamera('/shared/', value => states.push(value), () => {}, async url => {
    calls.push(url);
    return Response.json({ state: 'error', detail: 'Stream failed', setupSummary: 'Camera permission: Granted\nCamera stream: STOPPED' });
  });
  try {
    await settle();
    assert.equal(states[0].setupSummary, 'Camera permission: Granted\nCamera stream: STOPPED');
    assert.deepEqual(calls, ['/shared/status']);
  } finally { stop(); }
});
