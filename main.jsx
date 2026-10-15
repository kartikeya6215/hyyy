import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const KEY = 'fathom-simple-ledger-v1';
const CATEGORIES = {
  asset: ['Cash', 'Savings', 'Investments', 'Property', 'Vehicle', 'Other asset'],
  liability: ['Credit card', 'Loan', 'Mortgage', 'Student loan', 'Other liability'],
};
const starter = [
  { id: crypto.randomUUID(), name: 'Bank savings', kind: 'asset', category: 'Savings', balance: 85000 },
  { id: crypto.randomUUID(), name: 'Investments', kind: 'asset', category: 'Investments', balance: 42000 },
  { id: crypto.randomUUID(), name: 'Cash wallet', kind: 'asset', category: 'Cash', balance: 5000 },
  { id: crypto.randomUUID(), name: 'Education loan', kind: 'liability', category: 'Loan', balance: 25000 },
];
const currency = n => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(n) || 0);

function App() {
  const [accounts, setAccounts] = useState(() => {
    try { const saved = localStorage.getItem(KEY); return saved ? JSON.parse(saved) : starter; }
    catch { return starter; }
  });
  const [filter, setFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState({ name: '', kind: 'asset', category: 'Cash', balance: '' });
  const [notice, setNotice] = useState('');
  const fileRef = useRef(null);
  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(accounts)); }, [accounts]);
  const totals = useMemo(() => {
    const assets = accounts.filter(a => a.kind === 'asset').reduce((s, a) => s + Number(a.balance || 0), 0);
    const liabilities = accounts.filter(a => a.kind === 'liability').reduce((s, a) => s + Number(a.balance || 0), 0);
    return { assets, liabilities, net: assets - liabilities };
  }, [accounts]);
  const visible = accounts.filter(a => filter === 'all' || a.kind === filter);
  const assetPct = totals.assets + totals.liabilities ? totals.assets / (totals.assets + totals.liabilities) * 100 : 50;

  function addAccount(e) {
    e.preventDefault();
    const amount = Number(draft.balance);
    if (!draft.name.trim() || draft.balance === '' || !Number.isFinite(amount) || amount < 0) return;
    setAccounts(old => [...old, { ...draft, id: crypto.randomUUID(), name: draft.name.trim(), balance: amount }]);
    setDraft({ name: '', kind: 'asset', category: 'Cash', balance: '' });
    setShowForm(false); setNotice('Account added'); setTimeout(() => setNotice(''), 2200);
  }
  function updateBalance(id, value) {
    const amount = value === '' ? 0 : Math.max(0, Number(value) || 0);
    setAccounts(old => old.map(a => a.id === id ? { ...a, balance: amount } : a));
  }
  function removeAccount(id) { setAccounts(old => old.filter(a => a.id !== id)); }
  function exportData() {
    const blob = new Blob([JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), accounts }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'fathom-backup.json'; a.click(); URL.revokeObjectURL(url);
    setNotice('Backup downloaded'); setTimeout(() => setNotice(''), 2200);
  }
  function importData(e) {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        const rows = Array.isArray(data) ? data : data.accounts;
        if (!Array.isArray(rows) || rows.some(a => !a.name || !['asset','liability'].includes(a.kind) || !Number.isFinite(Number(a.balance)))) throw new Error('Invalid backup');
        setAccounts(rows.map(a => ({ id: a.id || crypto.randomUUID(), name: String(a.name), kind: a.kind, category: String(a.category || 'Other'), balance: Math.max(0, Number(a.balance)) })));
        setNotice('Backup imported'); setTimeout(() => setNotice(''), 2200);
      } catch { setNotice('Could not import this file. Choose a Fathom JSON backup.'); setTimeout(() => setNotice(''), 3500); }
      e.target.value = '';
    };
    reader.readAsText(file);
  }
  function loadDemo() { if (confirm('Replace your current accounts with demo data? Export a backup first if needed.')) { setAccounts(starter.map(a => ({ ...a, id: crypto.randomUUID() }))); setNotice('Demo data loaded'); setTimeout(() => setNotice(''), 2200); } }
  function clearAll() { if (confirm('Delete all accounts from this browser? Export a backup first if needed.')) setAccounts([]); }

  return <div className="app-shell">
    <header className="topbar"><a className="brand" href="#top" aria-label="Fathom home"><span className="brand-mark">f</span><span>fathom<span className="brand-dot">.</span></span></a><div className="top-actions"><span className="privacy"><i /> Private ledger</span><button className="button button-light" onClick={exportData}>↧ <span>Export backup</span></button></div></header>
    <main id="top" className="container">
      <section className="intro"><div><p className="eyebrow">YOUR FINANCIAL SNAPSHOT</p><h1>Know where you <em>stand.</em></h1><p className="subheading">A calmer, clearer view of your money.</p></div><div className="date-chip"><span className="date-dot" /> Updated today</div></section>
      <section className="hero-card"><div className="hero-copy"><div className="hero-label">TOTAL NET WORTH <span className="info" title="Assets minus liabilities">i</span></div><div className="net-worth">{currency(totals.net)}</div><p className="hero-caption">What you own, minus what you owe.</p></div><div className="hero-visual" aria-hidden="true"><div className="orb orb-one"/><div className="orb orb-two"/><div className="visual-ring ring-one"/><div className="visual-ring ring-two"/><span className="visual-star">✳</span></div><div className="hero-bottom"><span><b className="up-arrow">↗</b> Your financial picture, at a glance</span><span>INR · ₹</span></div></section>
      <section className="stat-grid"><article className="stat-card"><div className="stat-top"><span className="stat-icon asset-icon">↗</span><span className="stat-name">Total assets</span><span className="tiny-pill">OWNED</span></div><div className="stat-value">{currency(totals.assets)}</div><div className="mini-bar"><span style={{ width: `${assetPct}%` }} /></div><p className="stat-foot">Money and things you own</p></article><article className="stat-card"><div className="stat-top"><span className="stat-icon debt-icon">↘</span><span className="stat-name">Total liabilities</span><span className="tiny-pill debt-pill">OWED</span></div><div className="stat-value">{currency(totals.liabilities)}</div><div className="mini-bar debt-bar"><span style={{ width: `${100 - assetPct}%` }} /></div><p className="stat-foot">Money you still need to repay</p></article></section>
      <section className="section-heading"><div><p className="eyebrow">THE DETAILS</p><h2>Your accounts</h2><p className="section-description">Keep balances up to date. Your net worth recalculates automatically.</p></div><button className="button button-primary" onClick={() => setShowForm(v => !v)}>{showForm ? '× Cancel' : '+ Add account'}</button></section>
      {showForm && <form className="add-form" onSubmit={addAccount}><div className="form-heading"><strong>Add an account</strong><span>All amounts are in Indian rupees (₹)</span></div><div className="form-grid"><label>Account name<input autoFocus placeholder="e.g. Salary account" value={draft.name} onChange={e => setDraft(d => ({ ...d, name: e.target.value }))} required maxLength={70}/></label><label>Type<select value={draft.kind} onChange={e => { const kind = e.target.value; setDraft(d => ({ ...d, kind, category: CATEGORIES[kind][0] })); }}><option value="asset">Asset — I own it</option><option value="liability">Liability — I owe it</option></select></label><label>Category<select value={draft.category} onChange={e => setDraft(d => ({ ...d, category: e.target.value }))}>{CATEGORIES[draft.kind].map(c => <option key={c}>{c}</option>)}</select></label><label>Current balance (₹)<input type="number" min="0" step="1" placeholder="0" value={draft.balance} onChange={e => setDraft(d => ({ ...d, balance: e.target.value }))} required/></label></div><button className="button button-primary" type="submit">Save account</button></form>}
      <section className="accounts-card"><div className="accounts-toolbar"><div className="filter-tabs"><button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>All accounts <span>{accounts.length}</span></button><button className={filter === 'asset' ? 'active' : ''} onClick={() => setFilter('asset')}>Assets</button><button className={filter === 'liability' ? 'active' : ''} onClick={() => setFilter('liability')}>Liabilities</button></div><span className="table-total">{visible.length} shown</span></div>
      {visible.length ? <div className="account-list"><div className="account-row account-header"><span>ACCOUNT</span><span>CATEGORY</span><span>TYPE</span><span className="amount-col">BALANCE</span><span /></div>{visible.map(a => <div className="account-row" key={a.id}><div className="account-title"><span className={`account-symbol ${a.kind}`}>{a.kind === 'asset' ? '↗' : '↘'}</span><span><strong>{a.name}</strong><small>{a.kind === 'asset' ? 'Contributing to assets' : 'Outstanding balance'}</small></span></div><span className="category-label">{a.category}</span><span><span className={`type-pill ${a.kind}`}>{a.kind === 'asset' ? 'Asset' : 'Liability'}</span></span><label className="balance-edit"><span className="sr-only">Balance for {a.name}</span><span>₹</span><input aria-label={`Balance for ${a.name}`} type="number" min="0" step="1" value={a.balance} onChange={e => updateBalance(a.id, e.target.value)}/></label><button className="delete-button" aria-label={`Delete ${a.name}`} title="Delete account" onClick={() => removeAccount(a.id)}>×</button></div>)}</div> : <div className="empty-state"><span>◌</span><h3>No accounts here yet</h3><p>Add an account to start building your financial picture.</p><button className="button button-primary" onClick={() => setShowForm(true)}>+ Add your first account</button></div>}
      <div className="accounts-footer"><span><span className="live-dot"/> Changes save automatically on this device</span><button className="text-button" onClick={() => fileRef.current?.click()}>Import backup</button><input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={importData}/></div></section>
      <section className="bottom-grid"><article className="note-card"><div className="note-icon">✳</div><div><h3>Small steps, clearer picture.</h3><p>Update your balances regularly. A little consistency makes your progress easier to see.</p></div></article><article className="mix-card"><div className="mix-head"><div><p className="eyebrow">YOUR BALANCE SHEET</p><h3>Assets vs. liabilities</h3></div><span className="mix-symbol">◒</span></div><div className="mix-bar"><span style={{width:`${assetPct}%`}}/><span style={{width:`${100-assetPct}%`}}/></div><div className="mix-legend"><span><i className="legend-asset"/>Assets <b>{currency(totals.assets)}</b></span><span><i className="legend-debt"/>Liabilities <b>{currency(totals.liabilities)}</b></span></div></article></section>
      <section className="tools-row"><div><strong>Manage your data</strong><p>Keep a backup before switching devices or clearing your browser.</p></div><div className="tools-buttons"><button className="button button-light" onClick={loadDemo}>Load demo data</button><button className="button button-danger" onClick={clearAll}>Clear all</button></div></section>
      <footer className="footer"><span className="brand footer-brand"><span className="brand-mark">f</span><span>fathom<span className="brand-dot">.</span></span></span><span>Made for a clearer relationship with money.</span><span>Private by design · Stored on this device</span></footer>
    </main>
    {notice && <div className="toast" role="status">✓ &nbsp;{notice}</div>}
  </div>;
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
