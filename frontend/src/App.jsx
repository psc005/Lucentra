import { useState } from 'react'
import './App.css'
const API = import.meta.env.VITE_API_URL || 'http://localhost:3001'
const TYPES = ['Corporate registration', 'Ownership declaration', 'Board resolution', 'Identity document', 'Financial statement', 'Other']
const label = key => key.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase())
const value = v => Array.isArray(v) ? v.join(', ') || 'Not found' : String(v ?? 'Not found')

export default function App() {
  const [token, setToken] = useState('')
  const [password, setPassword] = useState('')
  const [files, setFiles] = useState([])
  const [documents, setDocuments] = useState([])
  const [findings, setFindings] = useState([])
  const [required, setRequired] = useState(['Corporate registration', 'Ownership declaration', 'Board resolution'])
  const [reviewed, setReviewed] = useState({})
  const [notes, setNotes] = useState('')
  const [business, setBusiness] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const missing = required.filter(type => !documents.some(doc => doc.documentType === type))
  async function login(event) {
    event.preventDefault(); setBusy(true); setMessage('')
    try {
      const response = await fetch(`${API}/api/login`, {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({password})})
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      setToken(data.token); setPassword('')
    } catch (error) { setMessage(error.message) } finally { setBusy(false) }
  }
  async function logout() {
    try { await fetch(`${API}/api/logout`, {method: 'POST', headers: {Authorization: `Bearer ${token}`}}) } finally {
      setToken(''); setFiles([]); setDocuments([]); setFindings([]); setNotes(''); setBusiness(''); setReviewed({}); setMessage('')
    }
  }
  function addFiles(list) {
    if (busy) return
    const next = [...files]
    for (const file of Array.from(list)) if (!next.some(f => f.name === file.name && f.size === file.size && f.lastModified === file.lastModified)) next.push(file)
    if (next.length > 30 || next.some(f => !f.name.toLowerCase().endsWith('.pdf') || f.size > 10 * 1024 * 1024) || next.reduce((s, f) => s + f.size, 0) > 60 * 1024 * 1024) {
      setMessage('Choose up to 30 PDFs: 10 MB per file, 60 MB per batch.'); return
    }
    setFiles(next); setDocuments([]); setFindings([]); setReviewed({}); setMessage('')
  }
  async function analyze() {
    setBusy(true); setMessage('Reading and comparing the document pack…'); setDocuments([]); setFindings([]); setReviewed({})
    try {
      const body = new FormData(); files.forEach(file => body.append('documents', file))
      const response = await fetch(`${API}/api/upload`, {method: 'POST', headers: {Authorization: `Bearer ${token}`}, body})
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      setDocuments(data.documents); setFindings(data.discrepancies); setMessage(data.message)
    } catch (error) { setMessage(error.message) } finally { setBusy(false) }
  }
  function exportReport() {
    const report = [`LUCENTRA — BUSINESS DOCUMENT REVIEW`, `Business: ${business || 'Not specified'}`, `Generated: ${new Date().toLocaleString()}`, `Documents reviewed by AI: ${documents.length}`, 'Human review required; this report does not verify identity or grant compliance approval.', '', 'BANKER-SELECTED CHECKLIST', ...required.map(type => `${missing.includes(type) ? 'Not detected' : 'Detected'}: ${type}`), '', 'CONFLICTS', ...findings.flatMap((f, i) => [`${label(f.field)} — ${reviewed[i] ? 'Reviewed by banker' : 'Open'}`, ...f.evidence.map(e => `${e.document}: ${value(e.value)}${e.source ? ` | Source: "${e.source.quote}"` : ' | Source quotation unavailable; verify original PDF'}`)]), '', 'DOCUMENT INVENTORY', ...documents.flatMap(d => [d.documentName + ' — ' + d.documentType, d.coverageNote || '', ...Object.entries(d.extractedData).map(([k, v]) => `${label(k)}: ${value(v)}`)]), '', 'APPOINTMENT NOTES', notes || 'None', '', 'Checklist is selected by the reviewer, not a bank policy assessment. AI labels and values may be wrong.']
    const url = URL.createObjectURL(new Blob([report.join('\n')], {type: 'text/plain'}))
    const a = document.createElement('a'); a.href = url; a.download = 'Lucentra-review-report.txt'; a.click(); URL.revokeObjectURL(url)
  }
  if (!token) return <main className="login"><form className="panel login-card" onSubmit={login}><div className="brand">L<span>ucentra</span></div><p className="eyebrow">BUSINESS DOCUMENT INTELLIGENCE</p><h1>Prepare for a better client conversation.</h1><p>Review business documents, find conflicting details, and bring a clear checklist to the appointment.</p><label>Reviewer password<input type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} required /></label><button disabled={busy}>{busy ? 'Signing in…' : 'Sign in to workspace'}</button><p role="status">{message}</p><small>Hackathon reviewer access · Use fictional documents only.</small></form></main>
  return <div className="workspace"><header><div className="brand">L<span>ucentra</span></div><span>Business review workspace</span><button className="secondary" onClick={logout} disabled={busy}>Sign out</button></header><main>
    <p className="eyebrow">PREPARE • COMPARE • REVIEW</p><h1>Every document. A clearer conversation.</h1><p className="intro"> </p>
    <div className="setup"><section className="panel"><h2>1. Build the document pack</h2><label>Business / appointment reference<input value={business} onChange={e => setBusiness(e.target.value)} placeholder=" " /></label><div className="drop" onDragOver={e => e.preventDefault()} onDrop={e => {e.preventDefault(); addFiles(e.dataTransfer.files)}}><strong>Drop business PDFs here</strong><p>Up to 30 files · 10 MB each · 60 MB total</p><label className="picker">Add PDFs<input type="file" accept=".pdf,application/pdf" multiple disabled={busy} onChange={e => {addFiles(e.target.files); e.target.value = ''}} /></label></div><ul className="file-list">{files.map((f, i) => <li key={`${f.name}-${i}`}><span>{f.name}</span><button className="secondary" aria-label={`Remove ${f.name}`} disabled={busy} onClick={() => {setFiles(files.filter((_, j) => i !== j)); setDocuments([]); setFindings([]); setReviewed({})}}>Remove</button></li>)}</ul><button disabled={busy || !files.length} onClick={analyze}>{busy ? 'Analyzing document pack…' : `Review ${files.length || ''} document${files.length === 1 ? '' : 's'}`}</button><p role="status">{message}</p></section>
    <section className="panel"><h2>2. Set the meeting checklist</h2><p>Select what you expect for this review.</p>{TYPES.filter(t => t !== 'Other').map(type => <label className="check" key={type}><input type="checkbox" checked={required.includes(type)} onChange={e => setRequired(e.target.checked ? [...required, type] : required.filter(t => t !== type))} />{type}</label>)}<div className="callout">Document types are recognized automatically. You can correct each label after analysis.</div><small> </small></section></div>
    {documents.length > 0 && <><div className="stats"><section className="panel"><b>{documents.length}</b><span>Documents analyzed</span></section><section className="panel"><b>{findings.filter((_, i) => !reviewed[i]).length}</b><span>Open conflicts</span></section><section className="panel"><b>{missing.length}</b><span>Expected categories not detected</span></section></div><section className="panel"><div className="section-head"><h2>3. Prepare the appointment</h2><button className="secondary" onClick={exportReport}>Download review report</button></div><p>{missing.length ? `Confirm or request: ${missing.join(', ')}.` : 'Selected document categories detected. Verify the labels and contents.'}</p><p>AI findings require human review. “No conflicts” does not mean the pack is complete or approved.</p><label>Questions and follow-up notes<textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Record clarifications, documents to request, or explanations from the business." /></label></section>
    <h2 className="results-title">Cross-document findings</h2>{!findings.length && <section className="panel">No conflicts found in the compared fields. Review the originals and the checklist.</section>}{findings.map((finding, i) => <section className="panel finding" key={i}><div className="section-head"><h3>{label(finding.field)}</h3><span className="badge">{reviewed[i] ? 'Reviewed' : 'Needs human review'}</span></div><p>{finding.message}</p><div className="evidence">{finding.evidence.map((e, j) => <div key={j}><small>{e.document}</small><strong>{value(e.value)}</strong>{e.source ? <blockquote>“{e.source.quote}”</blockquote> : <small>Source quotation unavailable — verify the original PDF.</small>}</div>)}</div><label className="check"><input type="checkbox" checked={!!reviewed[i]} onChange={e => setReviewed({...reviewed, [i]: e.target.checked})} />I reviewed this finding against the source documents</label></section>)}
    <h2 className="results-title">Document inventory</h2><div className="inventory">{documents.map((doc, i) => <section className="panel" key={i}><h3>{doc.documentName}</h3><label>Document label<select value={doc.documentType} onChange={e => setDocuments(documents.map((d, j) => i === j ? {...d, documentType: e.target.value} : d))}>{TYPES.map(t => <option key={t}>{t}</option>)}</select></label><small>{doc.classificationReason}</small>{doc.coverageNote && <p className="callout">{doc.coverageNote}</p>}<dl>{Object.entries(doc.extractedData).map(([key, v]) => <div key={key}><dt>{label(key)}</dt><dd>{value(v)}</dd></div>)}</dl></section>)}</div></>}
    <footer>Lucentra supports business document review. Final identity checks, due diligence, and decisions remain with the institution. Demo access; use fictional documents.</footer>
  </main></div>
}
