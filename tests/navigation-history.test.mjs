import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import ts from 'typescript'

const source = fs.readFileSync(new URL('../lib/navigation-history.ts', import.meta.url), 'utf8')
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
const sandbox = { exports: {} }
new Function('module', 'exports', compiled)(sandbox, sandbox.exports)
const { trackNavigationHistory } = sandbox.exports

function browser({ blockedStorage = false } = {}) {
  const entries = [{ state: null, url: 'https://outside.example/' }, { state: { __NA: true, tree: 'dashboard' }, url: '/dashboard/' }]
  const listeners = new Map(), storage = new Map(), pending = []
  let index = 1, uuid = 0
  const emit = name => listeners.get(name)?.forEach(fn => fn())
  const history = {
    get state() { return entries[index].state },
    pushState(state, unused, url) { entries.splice(index + 1, Infinity, { state: structuredClone(state), url }); index++ },
    replaceState(state, unused, url) { entries[index] = { state: structuredClone(state), url: url ?? entries[index].url } },
    go(delta) { pending.push(delta) },
  }
  const host = {
    history,
    crypto: { randomUUID: () => `trail-${++uuid}` },
    sessionStorage: {
      getItem: key => { if (blockedStorage) throw Error('Blocked'); return storage.get(key) ?? null },
      setItem: (key, value) => { if (blockedStorage) throw Error('Blocked'); storage.set(key, value) },
    },
    addEventListener: (name, fn) => { if (!listeners.has(name)) listeners.set(name, new Set()); listeners.get(name).add(fn) },
    removeEventListener: (name, fn) => listeners.get(name)?.delete(fn),
  }
  return { host, entries, pending, get url() { return entries[index].url }, flush() { while (pending.length) { index = Math.max(0, Math.min(entries.length - 1, index + pending.shift())); emit('popstate') } } }
}

test('back/forward follows pages and query-specific chats without leaving the app', () => {
  const b = browser(); let state
  const tracker = trackNavigationHistory(b.host, s => { state = s })
  assert.deepEqual(state, { canGoBack: false, canGoForward: false })
  tracker.go(-1); assert.equal(b.pending.length, 0)
  assert.equal(b.host.history.state.__NA, true)
  assert.equal(b.host.history.state.tree, 'dashboard')
  b.host.history.pushState({ __NA: true, tree: 'chat' }, '', '/assistant/?chat=first')
  b.host.history.pushState({ __NA: true, tree: 'chat' }, '', '/assistant/?chat=second')
  tracker.go(-1); b.flush()
  assert.equal(b.url, '/assistant/?chat=first')
  assert.deepEqual(state, { canGoBack: true, canGoForward: true })
  tracker.go(1); b.flush()
  assert.equal(b.url, '/assistant/?chat=second')
  assert.equal(state.canGoForward, false)
  tracker.dispose()
})

test('native browser navigation, reload and a new navigation branch stay synchronized', () => {
  const b = browser(); let state
  let tracker = trackNavigationHistory(b.host, s => { state = s })
  b.host.history.pushState({ __NA: true }, '', '/clients/')
  b.host.history.pushState({ __NA: true }, '', '/technicians/')
  b.host.history.go(-1); b.flush()
  tracker.dispose()
  tracker = trackNavigationHistory(b.host, s => { state = s })
  assert.deepEqual(state, { canGoBack: true, canGoForward: true })
  b.host.history.replaceState({ __NA: true, tree: 'updated-client' }, '', '/clients/?view=active')
  assert.equal(state.canGoForward, true)
  assert.equal(b.host.history.state.tree, 'updated-client')
  b.host.history.pushState({ __NA: true }, '', '/finance/')
  assert.equal(state.canGoForward, false)
  tracker.go(-1); b.flush()
  assert.equal(b.url, '/clients/?view=active')
  tracker.go(1); b.flush()
  assert.equal(b.url, '/finance/')
  tracker.dispose()
})

test('rapid back clicks cannot queue past the first BrokerOS screen', () => {
  const b = browser(); let state
  const tracker = trackNavigationHistory(b.host, s => { state = s })
  b.host.history.pushState({ __NA: true }, '', '/clients/')
  tracker.go(-1); tracker.go(-1); tracker.go(-1)
  assert.equal(b.pending.length, 1)
  b.flush()
  assert.equal(b.url, '/dashboard/')
  assert.equal(state.canGoBack, false)
  tracker.go(-1); assert.equal(b.pending.length, 0)
  tracker.dispose()
})

test('storage restrictions preserve in-tab navigation and cleanup restores browser methods', () => {
  const b = browser({ blockedStorage: true }); let state
  const originalPush = b.host.history.pushState, originalReplace = b.host.history.replaceState
  const tracker = trackNavigationHistory(b.host, s => { state = s })
  b.host.history.pushState({ __NA: true }, '', '/work-orders/wo-1001/')
  assert.equal(state.canGoBack, true)
  tracker.go(-1); b.flush()
  assert.equal(b.url, '/dashboard/')
  assert.equal(state.canGoForward, true)
  tracker.dispose()
  assert.equal(b.host.history.pushState, originalPush)
  assert.equal(b.host.history.replaceState, originalReplace)
})
