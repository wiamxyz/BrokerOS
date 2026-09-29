import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import ts from 'typescript'

const source = fs.readFileSync(new URL('../lib/value-tags.ts', import.meta.url), 'utf8')
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
const sandbox = { exports: {} }
new Function('module', 'exports', compiled)(sandbox, sandbox.exports)
const { valueTagId, valueTagReducer: reduce, initialValueTagState: initial, sampleTagReply } = sandbox.exports
const tag = (scope, field, value) => ({ id: valueTagId(scope, field), value, label: field })
const first = tag('contact:1', 'Client', 'Northstar Retail')

test('adding a value opens chat; repeat selection updates a single source in place', () => {
  const state = reduce(initial, { type: 'add', tag: first })
  const updated = reduce(state, { type: 'add', tag: { ...first, value: 'Updated client' } })
  assert.equal(state.open, true)
  assert.deepEqual(state.tags, [first])
  assert.deepEqual(updated.tags, [{ ...first, value: 'Updated client' }])
  assert.deepEqual(initial, { tags: [], open: false })
})

test('IDs are collision-safe and independent of sorting, value changes and component mounts', () => {
  assert.equal(valueTagId('contact:1', 'Client'), first.id)
  assert.notEqual(valueTagId('a:b', 'c'), valueTagId('a', 'b:c'))
  assert.notEqual(valueTagId('contact:1', 'Client'), valueTagId('contact:2', 'Client'))
  let state = reduce(initial, { type: 'add', tag: first })
  const other = tag('contact:2', 'Client', first.value)
  state = reduce(state, { type: 'add', tag: other })
  assert.deepEqual(state.tags, [first, other], 'equal text on distinct records is not the same source field')
})

test('removing one or all tags never changes open state', () => {
  const second = tag('contact:1', 'Status', 'Urgent')
  let state = reduce(reduce(initial, { type: 'add', tag: first }), { type: 'add', tag: second })
  state = reduce(state, { type: 'remove', id: first.id })
  assert.deepEqual(state, { open: true, tags: [second] })
  state = reduce(state, { type: 'remove', id: second.id })
  assert.deepEqual(state, { open: true, tags: [] })
  assert.deepEqual(reduce(state, { type: 'remove', id: 'unknown' }), state)
})

test('close and reopen retain tags; adding an existing tag reopens without duplicating', () => {
  let state = reduce(initial, { type: 'add', tag: first })
  state = reduce(state, { type: 'open', open: false })
  assert.deepEqual(state, { open: false, tags: [first] })
  state = reduce(state, { type: 'add', tag: first })
  assert.deepEqual(state, { open: true, tags: [first] })
})

test('empty values and IDs are rejected; zero is a valid value', () => {
  assert.equal(reduce(initial, { type: 'add', tag: { ...first, value: '  ' } }), initial)
  assert.equal(reduce(initial, { type: 'add', tag: { ...first, id: '' } }), initial)
  assert.equal(reduce(initial, { type: 'add', tag: { ...first, value: '0' } }).tags[0].value, '0')
})

test('sample reply includes only submitted selections and clearly identifies the demo', () => {
  const state = reduce(initial, { type: 'add', tag: first })
  const reply = sampleTagReply(state.tags)
  assert.ok(reply.includes('Northstar Retail'))
  assert.ok(!reply.includes('contact:1'))
  const removed = reduce(state, { type: 'remove', id: first.id })
  assert.ok(!sampleTagReply(removed.tags).includes('Northstar Retail'))
  assert.match(sampleTagReply([]), /sample conversation/)
  assert.match(reply, /sample reply/)
})
