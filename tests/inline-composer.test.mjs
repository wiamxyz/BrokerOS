import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import ts from 'typescript'

const source = fs.readFileSync(new URL('../lib/inline-composer.ts', import.meta.url), 'utf8')
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
const sandbox = { exports: {} }
new Function('module', 'exports', compiled)(sandbox, sandbox.exports)
const { normalizeComposer, composerTags, composerText, composerLength, insertComposerTag, restoreComposer, composerToJSON, composerFromJSON } = sandbox.exports
const tag = { id: 'deal:1:amount', value: '$1,020', label: 'Amount' }
const text = value => ({ type: 'text', text: value })

test('inline insertion preserves text on both sides and places the caret after the tag', () => {
  const original = [text('Compare with last month')]
  const result = insertComposerTag(original, tag, 8)
  assert.equal(composerText(result.parts), 'Compare $1,020 with last month')
  assert.equal(result.caret, 10)
  assert.deepEqual(original, [text('Compare with last month')])
  assert.equal(composerLength(result.parts), 25)
})

test('selecting the same source updates its inline snapshot without moving or duplicating it', () => {
  const first = insertComposerTag([text('Compare with last month')], tag, 8)
  const second = insertComposerTag(first.parts, { ...tag, value: '$2,000' }, 0)
  assert.equal(composerText(second.parts), 'Compare $2,000 with last month')
  assert.equal(composerTags(second.parts).length, 1)
  assert.equal(second.caret, 9)
})

test('inline order and line breaks survive editor JSON and stored draft round trips', () => {
  const parts = [text('Before '), { type: 'tag', tag }, text(' after\nAnother line')]
  assert.deepEqual(composerFromJSON(composerToJSON(parts)), parts)
  assert.deepEqual(restoreComposer(parts, 'ignored legacy text', []), parts)
  assert.equal(composerText(parts, false), 'Before  after\nAnother line')
  assert.deepEqual(restoreComposer([], 'old draft', [tag]), [])
})

test('older saved drafts migrate into inline tags without losing their text', () => {
  const parts = restoreComposer(undefined, 'Explain this', [tag])
  assert.equal(composerText(parts), '$1,020 Explain this')
  assert.deepEqual(composerTags(parts), [tag])
})

test('stored composer validation rejects invalid nodes and duplicate IDs, preserving equal values from different sources', () => {
  const parts = normalizeComposer([null, { type: 'html', html: '<script>bad()</script>' }, { type: 'tag', tag: { id: '', value: 'bad' } }, { type: 'tag', tag }, { type: 'tag', tag }, { type: 'tag', tag: { ...tag, id: 'deal:2:amount' } }, text(' x'), text(' y')])
  assert.equal(composerTags(parts).length, 2)
  assert.deepEqual(parts.at(-1), text(' x y'))
  assert.deepEqual(normalizeComposer('not a document'), [])
})
