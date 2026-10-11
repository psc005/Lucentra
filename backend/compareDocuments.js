function normalize(value) {
  if (Array.isArray(value)) return value.map(normalize).sort().join('|')
  return String(value ?? '').trim().toLowerCase().replace(/\s+/g, ' ')
}
function compareDocuments(documents) {
  const findings = []
  for (const field of ['businessName', 'businessAddress', 'registrationNumber', 'incorporationDate', 'jurisdiction', 'owners']) {
    const evidence = documents.map(doc => ({document: doc.documentName, value: doc.extractedData?.[field], source: doc.evidence?.[field] || null})).filter(item => normalize(item.value))
    if (new Set(evidence.map(item => normalize(item.value))).size > 1) findings.push({field, type: 'mismatch', severity: 'review', message: 'Conflicting extracted values. Check document dates, scope, and source text before deciding whether a correction is needed.', evidence})
  }
  return findings
}
module.exports = compareDocuments
