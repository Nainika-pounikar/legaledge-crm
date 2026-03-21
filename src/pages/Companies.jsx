import { useState } from 'react';
import { useCRM } from '../context/CRMContext';
import { OWNERS } from '../data/store';

const INDUSTRIES = ['Technology','Legal','Finance','Healthcare','Retail','Manufacturing','Education','Real Estate','Other'];
const SIZES      = ['','1-10','11-50','50-200','200-500','500-1000','1000+'];
const STATUSES   = ['Lead','Prospect','Customer','Partner'];

const EMPTY_FORM = {
  name:'', industry:'', size:'', city:'',
  website:'', revenue:'', status:'Lead', owner: OWNERS[0],
};

export default function Companies() {
  const { store, addRecord, deleteRecord, showToast } = useCRM();
  const [search,    setSearch]    = useState('');
  const [filter,    setFilter]    = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [form,      setForm]      = useState(EMPTY_FORM);
  const [errors,    setErrors]    = useState({});

  const filtered = store.companies.filter(c => {
    const q = search.toLowerCase();
    const matchQ = !q || c.name.toLowerCase().includes(q) || c.industry.toLowerCase().includes(q) || c.city.toLowerCase().includes(q);
    const matchF = filter === 'All' || c.status === filter || (filter === 'Active' && c.status !== 'Inactive');
    return matchQ && matchF;
  });

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: '' })); };

  const handleCreate = () => {
    const e = {};
    if (!form.name.trim())     e.name     = 'Company name is required';
    if (!form.industry)        e.industry = 'Industry is required';
    if (Object.keys(e).length) { setErrors(e); return; }
    addRecord('companies', { ...form, contacts: 0, deals: 0 });
    showToast('Company created successfully!');
    handleClose();
  };

  const handleClose = () => { setModalOpen(false); setForm(EMPTY_FORM); setErrors({}); };

  const statusBadge = s => ({ Customer:'success', Prospect:'info', Lead:'warning', Inactive:'secondary' }[s] || 'secondary');

  return (
    <div className="page-fade">

      {/* ── Header ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Companies</h1>
          <p className="page-subtitle">{store.companies.length} companies</p>
        </div>
        <button className="btn-primary" onClick={() => setModalOpen(true)}>
          <i className="fa fa-plus" /> Add Company
        </button>
      </div>

      {/* ── Table card ── */}
      <div className="card">
        <div className="card-toolbar">
          <div className="search-box">
            <i className="fa fa-search" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search companies…"/>
          </div>
          <div className="filter-tabs">
            {['All','Customer','Lead','Prospect','Active','Inactive'].map(f => (
              <button key={f} className={`filter-tab${filter===f?' active':''}`} onClick={() => setFilter(f)}>{f}</button>
            ))}
          </div>
        </div>

        <div className="table-container">
<table className="data-table">
          <thead>
            <tr>
              <th>Company</th><th>Industry</th><th>Size</th><th>City</th>
              <th>Revenue</th><th>Contacts</th><th>Deals</th>
              <th>Status</th><th>Owner</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id}>
                <td>
                  <div className="fw-600">{c.name}</div>
                  <div className="txt-muted txt-sm">{c.website}</div>
                </td>
                <td>{c.industry}</td>
                <td>{c.size}</td>
                <td>{c.city}</td>
                <td>{c.revenue}</td>
                <td>{c.contacts}</td>
                <td>{c.deals}</td>
                <td><span className={`badge badge-${statusBadge(c.status)}`}>{c.status}</span></td>
                <td className="txt-sm">{c.owner}</td>
                <td>
                  <div className="action-btns">
                    <button className="btn-icon btn-icon-danger" title="Delete"
                      onClick={() => { deleteRecord('companies', c.id); showToast('Company deleted'); }}>
                      <i className="fa fa-trash" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!filtered.length && (
              <tr><td colSpan={10} className="empty-state">
                <i className="fa fa-building" /><br />No companies found
              </td></tr>
            )}
          </tbody>
        </table>
</div>
      </div>

      {/* ══ Create Company Modal — exact same as Topbar CreateModal ══ */}
      {modalOpen && (
        <div className="modal-overlay show" onClick={e => { if (e.target.classList.contains('modal-overlay')) handleClose(); }}>
          <div className="modal" style={{ maxWidth:520 }} onClick={e => e.stopPropagation()}>

            <div className="modal-header">
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <button className="btn-icon" onClick={handleClose} title="Back"><i className="fa fa-arrow-left"/></button>
                <h3>Create Company</h3>
              </div>
              <button className="modal-close" onClick={handleClose}>×</button>
            </div>

            <div className="form-body">

              {/* Company Name */}
              <div className="form-group">
                <label className="form-label">Company Name <span className="required">*</span></label>
                <input className={`form-control${errors.name?' is-err':''}`}
                  value={form.name} onChange={e => set('name', e.target.value)}/>
                {errors.name && <div className="form-error show">{errors.name}</div>}
              </div>

              {/* Industry + Size */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Industry <span className="required">*</span></label>
                  <select className={`form-control${errors.industry?' is-err':''}`}
                    value={form.industry} onChange={e => set('industry', e.target.value)}>
                    <option value="">Select industry</option>
                    {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
                  </select>
                  {errors.industry && <div className="form-error show">{errors.industry}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Size</label>
                  <select className="form-control" value={form.size} onChange={e => set('size', e.target.value)}>
                    {SIZES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* City + Website */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input className="form-control"
                    value={form.city} onChange={e => set('city', e.target.value)}/>
                </div>
                <div className="form-group">
                  <label className="form-label">Website</label>
                  <input className="form-control"
                    value={form.website} onChange={e => set('website', e.target.value)}/>
                </div>
              </div>

              {/* Annual Revenue + Status */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Annual Revenue</label>
                  <input className="form-control"
                    value={form.revenue} onChange={e => set('revenue', e.target.value)}/>
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-control" value={form.status} onChange={e => set('status', e.target.value)}>
                    {STATUSES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* Owner */}
              <div className="form-group">
                <label className="form-label">Owner</label>
                <select className="form-control" value={form.owner} onChange={e => set('owner', e.target.value)}>
                  {OWNERS.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>

            </div>

            <div className="form-actions">
              <button className="btn-secondary" onClick={handleClose}>Cancel</button>
              <button className="btn-primary" onClick={handleCreate}>
                <i className="fa fa-check"/> Save Company
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}