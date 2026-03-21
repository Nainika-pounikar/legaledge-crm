import { useState } from 'react';
import { useCRM } from '../context/CRMContext';
import { fmtINR, OWNERS, todayStr } from '../data/store';
import DeleteConfirm from '../components/DeleteConfirm';
import { filterByRole } from '../utils/permissions';
import {
  REQUIRED_ERROR,
  required,
  sanitizeDigits,
  sanitizePercentage,
} from '../utils/formValidation';

const STAGES = ['New Lead', 'Contacted', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];

const EMPTY_FORM = {
  name: '', company: '', contact: '', value: '',
  stage: 'New Lead', closeDate: '', probability: 50, owner: OWNERS[0],
};

const formatDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

export default function Deals() {
  const { store, addRecord, updateRecord, deleteRecord, addActivity, showToast, currentUser } = useCRM();
  const [view, setView] = useState('table');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [editingDealId, setEditingDealId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const role = currentUser?.role;
  const canManageDeals = ['admin', 'manager'].includes(role);
  const canDeleteDeal = role === 'admin';
  const showActionsColumn = canManageDeals || canDeleteDeal;
  const scopedDeals = filterByRole(store.deals || [], currentUser);

  const rows = scopedDeals.filter((d) => {
    const q = search.toLowerCase();
    return !q || d.name.toLowerCase().includes(q) || d.company.toLowerCase().includes(q) || String(d.contact || '').toLowerCase().includes(q);
  });

  const pipeline = scopedDeals.filter((d) => !['Closed Won', 'Closed Lost'].includes(d.stage)).reduce((s, d) => s + d.value, 0);
  const wonRev = scopedDeals.filter((d) => d.stage === 'Closed Won').reduce((s, d) => s + d.value, 0);

  const stageBadge = (s) => ({ 'Closed Won': 'success', 'Closed Lost': 'danger', Negotiation: 'warning', Proposal: 'purple' }[s] || 'info');
  const activityRows = (store.activities || [])
    .filter((a) => a.entity === 'deal')
    .slice()
    .sort((a, b) => new Date(b.at || 0) - new Date(a.at || 0))
    .slice(0, 5);

  const set = (k, v) => {
    setForm((p) => ({ ...p, [k]: v }));
    setErrors((p) => ({ ...p, [k]: '' }));
  };

  const handleEdit = (deal) => {
    setForm({
      ...deal,
      value: String(deal.value ?? ''),
      probability: String(deal.probability ?? 0),
    });
    setEditingDealId(deal.id);
    setModalOpen(true);
  };

  const handleSubmit = () => {
    const e = {};
    if (!required(form.name)) e.name = REQUIRED_ERROR;
    if (!required(form.company)) e.company = REQUIRED_ERROR;
    if (!required(form.contact)) e.contact = REQUIRED_ERROR;
    if (!required(form.value)) e.value = REQUIRED_ERROR;
    if (!required(form.closeDate)) e.closeDate = REQUIRED_ERROR;
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }

    const payload = {
      ...form,
      value: parseInt(form.value, 10) || 0,
      probability: parseInt(form.probability, 10) || 0,
      created: form.created || todayStr(),
      teamId: form.teamId ?? currentUser?.teamId ?? null,
      assignedTo: form.assignedTo ?? currentUser?.id ?? null,
    };

    if (editingDealId) {
      updateRecord('deals', { ...payload, id: editingDealId });
      addActivity({
        entity: 'deal',
        entityId: editingDealId,
        action: 'updated',
        detail: `Deal ${form.name} updated for ${form.company}`,
        owner: currentUser?.name || form.owner,
      });
      showToast('Deal updated successfully!');
    } else {
      addRecord('deals', payload);
      addActivity({
        entity: 'deal',
        action: 'created',
        detail: `Deal ${form.name} created for ${form.company}`,
        owner: currentUser?.name || form.owner,
      });
      showToast('Deal created successfully!');
    }

    handleClose();
  };

  const handleDelete = () => {
    if (!deleteTarget) return;

    deleteRecord('deals', deleteTarget.id);
    addActivity({
      entity: 'deal',
      entityId: deleteTarget.id,
      action: 'deleted',
      detail: `Deal ${deleteTarget.name} deleted`,
      owner: currentUser?.name || deleteTarget.owner,
    });
    showToast('Deal deleted');
    setDeleteTarget(null);
  };

  const handleClose = () => {
    setModalOpen(false);
    setForm(EMPTY_FORM);
    setErrors({});
    setEditingDealId(null);
  };

  return (
    <div className="page-fade">
      <div className="page-header">
        <div>
          <h1 className="page-title">Deals</h1>
          <p className="page-subtitle">Pipeline: {fmtINR(pipeline)} | Won: {fmtINR(wonRev)}</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {canManageDeals && (
            <button className="btn-primary" onClick={() => setModalOpen(true)}>
              <i className="fa fa-plus" /> Add Deal
            </button>
          )}
          <button className={view === 'table' ? 'btn-primary' : 'btn-secondary'} onClick={() => setView('table')} title="Table View"><i className="fa fa-table" /></button>
          <button className={view === 'kanban' ? 'btn-primary' : 'btn-secondary'} onClick={() => setView('kanban')} title="Kanban View"><i className="fa fa-columns" /></button>
        </div>
      </div>

      {view === 'kanban' ? (
        <div className="kanban-board">
          {STAGES.map((stage) => {
            const cards = scopedDeals.filter((d) => d.stage === stage);
            const total = cards.reduce((s, d) => s + d.value, 0);
            return (
              <div key={stage} className="kanban-col">
                <div className="kanban-col-header">
                  <span className="fw-700 txt-sm">{stage}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className={`badge badge-${stageBadge(stage)}`}>{cards.length}</span>
                  </div>
                </div>
                <div className="txt-muted txt-xs" style={{ padding: '0 12px 10px' }}>{fmtINR(total)}</div>
                {cards.map((d) => (
                  <div key={d.id} className="kanban-card">
                    <div className="fw-600 txt-sm" style={{ marginBottom: 4 }}>{d.name}</div>
                    <div className="txt-muted txt-xs" style={{ marginBottom: 8 }}>{d.company} | {d.contact}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="fw-700 txt-primary">{fmtINR(d.value)}</span>
                      <span className="txt-xs txt-muted">{d.probability}% win</span>
                    </div>
                    <div className="prob-bar" style={{ marginTop: 8 }}>
                      <div className="prob-fill" style={{ width: `${d.probability}%`, background: d.probability >= 70 ? 'var(--success)' : d.probability >= 40 ? 'var(--warning)' : 'var(--danger)' }} />
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card">
          <div className="card-toolbar">
            <div className="search-box">
              <i className="fa fa-search" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search deals..." />
            </div>
          </div>
          <div className="table-responsive">
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Deal</th>
                    <th>Company</th>
                    <th>Stage</th>
                    <th>Value</th>
                    <th>Probability</th>
                    <th>Close Date</th>
                    <th>Owner</th>
                    {showActionsColumn && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((d) => (
                    <tr key={d.id}>
                      <td>
                        <div className="fw-600">{d.name}</div>
                        <div className="txt-muted txt-sm">{d.contact}</div>
                      </td>
                      <td>{d.company}</td>
                      <td><span className={`badge badge-${stageBadge(d.stage)}`}>{d.stage}</span></td>
                      <td className="fw-700 txt-primary">{fmtINR(d.value)}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div className="prob-bar" style={{ flex: 1 }}>
                            <div className="prob-fill" style={{ width: `${d.probability}%`, background: d.probability >= 70 ? 'var(--success)' : d.probability >= 40 ? 'var(--warning)' : 'var(--danger)' }} />
                          </div>
                          <span className="txt-sm">{d.probability}%</span>
                        </div>
                      </td>
                      <td className="txt-sm">{formatDate(d.closeDate)}</td>
                      <td className="txt-sm">{d.owner}</td>
                      {showActionsColumn && (
                        <td>
                          <div className="action-btns">
                            {canManageDeals && (
                              <button className="btn-icon" title="Edit" onClick={() => handleEdit(d)}><i className="fa fa-edit" /></button>
                            )}
                            {canDeleteDeal && (
                              <button className="btn-icon btn-icon-danger" title="Delete" onClick={() => setDeleteTarget(d)}>
                                <i className="fa fa-trash" />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                  {!rows.length && (
                    <tr>
                      <td colSpan={showActionsColumn ? 8 : 7} className="empty-state">
                        <i className="fa fa-handshake" /><br />No deals found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-toolbar">
          <h3 className="card-title" style={{ margin: 0 }}>Deal Activity</h3>
        </div>
        {!activityRows.length ? (
          <div className="empty-state">
            <i className="fa fa-clock-rotate-left" /><br />No deal activity yet
          </div>
        ) : (
          <div style={{ padding: '0 16px 16px', display: 'grid', gap: 10 }}>
            {activityRows.map((a) => (
              <div key={a.id} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px' }}>
                <div className="fw-600 txt-sm">{a.detail}</div>
                <div className="txt-muted txt-sm">{a.owner} | {new Date(a.at).toLocaleString()}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="modal-overlay show" onClick={(e) => { if (e.target.classList.contains('modal-overlay')) handleClose(); }}>
          <div className="modal" style={{ maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button className="btn-icon" onClick={handleClose} title="Back"><i className="fa fa-arrow-left" /></button>
                <h3>{editingDealId ? 'Edit Deal' : 'Create Deal'}</h3>
              </div>
              <button className="modal-close" onClick={handleClose} aria-label="Close">&times;</button>
            </div>

            <div className="form-body">
              <div className="form-group">
                <label className="form-label">Deal Name <span className="required">*</span></label>
                <input className={`form-control${errors.name ? ' is-err' : ''}`} value={form.name} onChange={(e) => set('name', e.target.value)} />
                {errors.name && <div className="form-error show">{errors.name}</div>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Company <span className="required">*</span></label>
                  <input className={`form-control${errors.company ? ' is-err' : ''}`} value={form.company} onChange={(e) => set('company', e.target.value)} />
                  {errors.company && <div className="form-error show">{errors.company}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Contact <span className="required">*</span></label>
                  <input className={`form-control${errors.contact ? ' is-err' : ''}`} value={form.contact} onChange={(e) => set('contact', e.target.value)} placeholder="Enter contact name" />
                  {errors.contact && <div className="form-error show">{errors.contact}</div>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Deal Value (INR) <span className="required">*</span></label>
                  <input
                    className={`form-control${errors.value ? ' is-err' : ''}`}
                    type="text"
                    inputMode="numeric"
                    value={form.value}
                    onChange={(e) => set('value', sanitizeDigits(e.target.value))}
                    onPaste={(e) => {
                      e.preventDefault();
                      set('value', sanitizeDigits(e.clipboardData.getData('text')));
                    }}
                  />
                  {errors.value && <div className="form-error show">{errors.value}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Pipeline Stage</label>
                  <select className="form-control" value={form.stage} onChange={(e) => set('stage', e.target.value)}>
                    {STAGES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Close Date <span className="required">*</span></label>
                  <input className={`form-control${errors.closeDate ? ' is-err' : ''}`} type="date" value={form.closeDate} onChange={(e) => set('closeDate', e.target.value)} />
                  {errors.closeDate && <div className="form-error show">{errors.closeDate}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Win Probability (%)</label>
                  <input
                    className="form-control"
                    type="text"
                    inputMode="numeric"
                    value={form.probability}
                    onChange={(e) => set('probability', sanitizePercentage(e.target.value))}
                    onPaste={(e) => {
                      e.preventDefault();
                      set('probability', sanitizePercentage(e.clipboardData.getData('text')));
                    }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Owner</label>
                <select className="form-control" value={form.owner} onChange={(e) => set('owner', e.target.value)}>
                  {OWNERS.map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>
            </div>

            <div className="form-actions">
              <button className="btn-secondary" onClick={handleClose}>Cancel</button>
              <button className="btn-primary" onClick={handleSubmit}>
                <i className="fa fa-check" /> {editingDealId ? 'Update Deal' : 'Save Deal'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <DeleteConfirm
          title="Delete Deal"
          message={`Are you sure you want to delete ${deleteTarget.name}? This action cannot be undone.`}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
