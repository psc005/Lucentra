const test = require('node:test')
const assert = require('node:assert/strict')
const compare = require('./compareDocuments')
const doc = (name, data, evidence = {}) => ({documentName: name, extractedData: data, evidence})
test('does not require every field on every form', () => {
  assert.deepEqual(compare([doc('registration', {businessName: 'Acme'}), doc('resolution', {})]), [])
})
test('compares ownership without depending on name order', () => {
  assert.equal(compare([doc('a', {owners: ['Pat', 'Lee']}), doc('b', {owners: ['lee', ' pat ']} )]).length, 0)
  assert.equal(compare([doc('a', {owners: ['Pat']}), doc('b', {owners: ['Lee']})])[0].field, 'owners')
})
test('conflict retains document and source quotation', () => {
  const result = compare([doc('a.pdf', {registrationNumber: '123'}, {registrationNumber: {quote: 'Registration 123', page: null}}), doc('b.pdf', {registrationNumber: '456'})])
  assert.equal(result.length, 1)
  assert.equal(result[0].evidence[0].document, 'a.pdf')
  assert.equal(result[0].evidence[0].source.quote, 'Registration 123')
})
test('empty model fields do not crash or become conflicts', () => {
  assert.deepEqual(compare([{documentName: 'a'}, doc('b', {owners: []})]), [])
})
