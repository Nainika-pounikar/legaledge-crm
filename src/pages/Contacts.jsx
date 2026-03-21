import { useState } from 'react';
import { useCRM } from '../context/CRMContext';
import { initials, AVATAR_COLORS, OWNERS, todayStr } from '../data/store';
import EmailModal from '../components/EmailModal';
import DeleteConfirm from '../components/DeleteConfirm';
import { filterByRole } from '../utils/permissions';
import {
  PHONE_ERROR,
  REQUIRED_ERROR,
  isValidEmail,
  isValidPhone,
  required,
  sanitizeDigits,
  sanitizePercentage,
  sanitizePhone,
} from '../utils/formValidation';

const INDUSTRIES = ['Technology', 'Legal', 'Finance', 'Healthcare', 'Retail', 'Manufacturing', 'Education', 'Real Estate', 'Other'];
const DEAL_STAGES = ['New Lead', 'Contacted', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];

const EMPTY_FORM = {
  fname: '', lname: '', email: '', phone: '', company: '',
  role: '', city: '', industry: '', type: 'Lead', priority: 'Medium', owner: OWNERS[0],
};
const EMPTY_DEAL_FORM = {
  name: '', company: '', contact: '', value: '',
  stage: 'New Lead', closeDate: '', probability: 50, owner: OWNERS[0], sourceContactId: null,
};

export default function Contacts() {
  const { store, addRecord, updateRecord, deleteRecord, addActivity, showToast, currentUser } = useCRM();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [emailTarget, setEmailTarget] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [dealModalOpen, setDealModalOpen] = useState(false);
  const [dealForm, setDealForm] = useState(EMPTY_DEAL_FORM);
  const [dealErrors, setDealErrors] = useState({});
  const [editingContactId, setEditingContactId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const role = currentUser?.role;
  const canManageContacts = ['admin', 'manager'].includes(role);
  const canDeleteContact = role === 'admin';
  const scopedContacts = filterByRole(store.contacts || [], currentUser);

  const rows = scopedContacts.filter((c) => {
    const q = search.toLowerCase();
    const matchQ = !q || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.company.toLowerCase().includes(q);
    const matchF = filter === 'All' || c.type === filter || (filter === 'Active' && c.status === 'active') || (filter === 'Inactive' && c.status === 'inactive');
    return matchQ && matchF;
  });

  const set = (k, v) => {
    setForm((p) => ({ ...p, [k]: v }));
    setErrors((p) => ({ ...p, [k]: '' }));
  };

  const handleEdit = (contact) => {
    const parts = String(contact.name || '').trim().split(/\s+/);
    const fname = parts.shift() || '';
    const lname = parts.join(' ');
    setForm({
      fname,
      lname,
      email: contact.email || '',
      phone: sanitizePhone(contact.phone || ''),
      company: contact.company || '',
      role: contact.role || '',
      city: contact.city || '',
      industry: contact.industry || '',
      type: contact.type || 'Lead',
      priority: contact.priority || 'Medium',
      owner: contact.owner || OWNERS[0],
      status: contact.status,
      created: contact.created,
      lastContact: contact.lastContact,
      teamId: contact.teamId,
      assignedTo: contact.assignedTo,
    });
    setEditingContactId(contact.id);
    setModalOpen(true);
  };

  const handleSubmit = () => {
    const e = {};
    if (!required(form.fname)) e.fname = REQUIRED_ERROR;
    if (!required(form.lname)) e.lname = REQUIRED_ERROR;
    if (!required(form.email)) e.email = REQUIRED_ERROR;
    else if (!isValidEmail(form.email)) e.email = 'Enter valid email address';
    if (!required(form.phone)) e.phone = REQUIRED_ERROR;
    else if (!isValidPhone(form.phone)) e.phone = PHONE_ERROR;
    if (!required(form.company)) e.company = REQUIRED_ERROR;
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }

    const payload = {
      name: `${form.fname} ${form.lname}`.trim(),
      email: form.email,
      phone: form.phone,
      company: form.company,
      role: form.role,
      city: form.city,
      industry: form.industry,
      type: form.type,
      priority: form.priority,
      owner: form.owner,
      status: form.status || 'active',
      created: form.created || todayStr(),
      lastContact: todayStr(),
      teamId: form.teamId ?? currentUser?.teamId ?? null,
      assignedTo: form.assignedTo ?? currentUser?.id ?? null,
    };

    if (editingContactId) {
      updateRecord('contacts', { ...payload, id: editingContactId });
      addActivity({
        entity: 'contact',
        entityId: editingContactId,
        action: 'updated',
        detail: `Contact ${payload.name} updated`,
        owner: currentUser?.name || payload.owner,
      });
      showToast('Contact updated successfully!');
    } else {
      addRecord('contacts', payload);
      addActivity({
        entity: 'contact',
        action: 'created',
        detail: `Contact ${payload.name} created`,
        owner: currentUser?.name || payload.owner,
      });
      showToast('Contact created successfully!');
    }

    handleClose();
  };

  const handleClose = () => {
    setModalOpen(false);
    setForm(EMPTY_FORM);
    setErrors({});
    setEditingContactId(null);
  };

  const setDeal = (k, v) => {
    setDealForm((p) => ({ ...p, [k]: v }));
    setDealErrors((p) => ({ ...p, [k]: '' }));
  };

  const openDealFromContact = (contact) => {
    setDealForm({
      ...EMPTY_DEAL_FORM,
      name: `${contact.company} Opportunity`,
      company: contact.company,
      contact: contact.name || '',
      owner: contact.owner || OWNERS[0],
      sourceContactId: contact.id,
    });
    setDealErrors({});
    setDealModalOpen(true);
  };

  const closeDealModal = () => {
    setDealModalOpen(false);
    setDealForm(EMPTY_DEAL_FORM);
    setDealErrors({});
  };

  const handleCreateDealFromContact = () => {
    const e = {};
    if (!required(dealForm.name)) e.name = REQUIRED_ERROR;
    if (!required(dealForm.company)) e.company = REQUIRED_ERROR;
    if (!required(dealForm.contact)) e.contact = REQUIRED_ERROR;
    if (!required(dealForm.value)) e.value = REQUIRED_ERROR;
    if (!required(dealForm.closeDate)) e.closeDate = REQUIRED_ERROR;
    if (Object.keys(e).length) {
      setDealErrors(e);
      return;
    }

    addRecord('deals', {
      ...dealForm,
      value: parseInt(dealForm.value, 10) || 0,
      probability: parseInt(dealForm.probability, 10) || 0,
      created: todayStr(),
      teamId: currentUser?.teamId ?? null,
      assignedTo: currentUser?.id ?? null,
    });
    addActivity({
      entity: 'deal',
      action: 'created',
      detail: `Deal ${dealForm.name} created from contact`,
      owner: currentUser?.name || dealForm.owner,
    });
    showToast('Deal created from contact successfully!');
    closeDealModal();
  };

  const handleDelete = () => {
    if (!deleteTarget) return;

    deleteRecord('contacts', deleteTarget.id);
    addActivity({
      entity: 'contact',
      entityId: deleteTarget.id,
      action: 'deleted',
      detail: `Contact ${deleteTarget.name} deleted`,
      owner: currentUser?.name || deleteTarget.owner,
    });
    showToast('Contact deleted');
    setDeleteTarget(null);
  };

  return (
    <div className="page-fade">
      <div className="page-header">
        <div>
          <h1 className="page-title">Contacts</h1>
          <p className="page-subtitle">{scopedContacts.length} total | {scopedContacts.filter((c) => c.status === 'active').length} active</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {canManageContacts && (
            <button className="btn-primary" onClick={() => setModalOpen(true)}>
              <i className="fa fa-plus" /> Add Contact
            </button>
          )}
          <button className="btn-secondary" onClick={() => showToast('Contact import wizard is coming soon.', 'info')}><i className="fa fa-upload" /> Import</button>
          <button className="btn-secondary" onClick={() => showToast('Contacts exported successfully!')}><i className="fa fa-download" /> Export</button>
        </div>
      </div>

      <div className="card">
        <div className="card-toolbar">
          <div className="search-box">
            <i className="fa fa-search" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search contacts..." />
          </div>
          <div className="filter-tabs">
            {['All', 'Customer', 'Lead', 'Prospect', 'Active', 'Inactive'].map((f) => (
              <button key={f} className={`filter-tab${filter === f ? ' active' : ''}`} onClick={() => setFilter(f)}>{f}</button>
            ))}
          </div>
        </div>

        <div className="table-responsive">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Contact</th><th>Company</th><th>Industry</th>
                  <th>Type</th><th>Priority</th><th>Owner</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((c, i) => (
                  <tr key={c.id}>
                    <td>
                      <div className="contact-cell">
                        <div className={`avatar ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}>{initials(c.name)}</div>
                        <div>
                          <div className="fw-600">{c.name}</div>
                          <div className="txt-muted txt-sm">{c.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="fw-500">{c.company}</div>
                      <div className="txt-muted txt-sm">{c.role} | {c.city}</div>
                    </td>
                    <td>{c.industry}</td>
                    <td><span className={`badge badge-${c.type === 'Customer' ? 'success' : c.type === 'Lead' ? 'warning' : 'info'}`}>{c.type}</span></td>
                    <td><span className={`badge badge-${c.priority === 'High' ? 'danger' : c.priority === 'Medium' ? 'warning' : 'secondary'}`}>{c.priority}</span></td>
                    <td className="txt-sm">{c.owner}</td>
                    <td><span className={`badge badge-${c.status === 'active' ? 'success' : 'secondary'}`}>{c.status}</span></td>
                    <td>
                      <div className="action-btns">
                        <button className="btn-icon" title="Send Email" onClick={() => setEmailTarget(c)}>
                          <i className="fa fa-envelope" />
                        </button>
                        {canManageContacts && (
                          <>
                            <button className="btn-icon" title="Edit" onClick={() => handleEdit(c)}>
                              <i className="fa fa-edit" />
                            </button>
                            <button className="btn-icon" title="Create Deal" onClick={() => openDealFromContact(c)}>
                              <i className="fa fa-handshake" />
                            </button>
                          </>
                        )}
                        {canDeleteContact && (
                          <button className="btn-icon btn-icon-danger" title="Delete" onClick={() => setDeleteTarget(c)}>
                            <i className="fa fa-trash" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {!rows.length && (
                  <tr><td colSpan={8} className="empty-state">
                    <i className="fa fa-users" /><br />No contacts found
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <EmailModal
        open={!!emailTarget}
        onClose={() => setEmailTarget(null)}
        defaultTo={emailTarget?.email || ''}
        defaultSubject={emailTarget ? `Hello ${emailTarget.name.split(' ')[0]}` : ''}
      />

      {modalOpen && (
        <div className="modal-overlay show" onClick={(e) => { if (e.target.classList.contains('modal-overlay')) handleClose(); }}>
          <div className="modal" style={{ maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button className="btn-icon" onClick={handleClose} title="Back"><i className="fa fa-arrow-left" /></button>
                <h3>{editingContactId ? 'Edit Contact' : 'Create Contact'}</h3>
              </div>
              <button className="modal-close" onClick={handleClose} aria-label="Close">&times;</button>
            </div>

            <div className="form-body">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">First Name <span className="required">*</span></label>
                  <input className={`form-control${errors.fname ? ' is-err' : ''}`} value={form.fname} onChange={(e) => set('fname', e.target.value)} />
                  {errors.fname && <div className="form-error show">{errors.fname}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name <span className="required">*</span></label>
                  <input className={`form-control${errors.lname ? ' is-err' : ''}`} value={form.lname} onChange={(e) => set('lname', e.target.value)} />
                  {errors.lname && <div className="form-error show">{errors.lname}</div>}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email <span className="required">*</span></label>
                <input className={`form-control${errors.email ? ' is-err' : ''}`} type="email" value={form.email} onChange={(e) => set('email', e.target.value)} />
                {errors.email && <div className="form-error show">{errors.email}</div>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Phone <span className="required">*</span></label>
                  <input
                    type="tel"
                    className={`form-control${errors.phone ? ' is-err' : ''}`}
                    value={form.phone}
                    onChange={(e) => set('phone', sanitizePhone(e.target.value))}
                    onPaste={(e) => {
                      e.preventDefault();
                      set('phone', sanitizePhone(e.clipboardData.getData('text')));
                    }}
                    placeholder="Enter 10 digit number"
                    maxLength={10}
                  />
                  {errors.phone && <div className="form-error show">{errors.phone}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Job Title</label>
                  <input className="form-control" value={form.role} onChange={(e) => set('role', e.target.value)} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Company <span className="required">*</span></label>
                <input className={`form-control${errors.company ? ' is-err' : ''}`} value={form.company} onChange={(e) => set('company', e.target.value)} />
                {errors.company && <div className="form-error show">{errors.company}</div>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input className="form-control" value={form.city} onChange={(e) => set('city', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Industry</label>
                  <select className="form-control" value={form.industry} onChange={(e) => set('industry', e.target.value)}>
                    <option value="">Select industry</option>
                    {INDUSTRIES.map((i) => <option key={i}>{i}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select className="form-control" value={form.type} onChange={(e) => set('type', e.target.value)}>
                    {['Customer', 'Lead', 'Prospect', 'Partner'].map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select className="form-control" value={form.priority} onChange={(e) => set('priority', e.target.value)}>
                    {['High', 'Medium', 'Low'].map((p) => <option key={p}>{p}</option>)}
                  </select>
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
                <i className="fa fa-check" /> {editingContactId ? 'Update Contact' : 'Save Contact'}
              </button>
            </div>
          </div>
        </div>
      )}

      {dealModalOpen && (
        <div className="modal-overlay show" onClick={(e) => { if (e.target.classList.contains('modal-overlay')) closeDealModal(); }}>
          <div className="modal" style={{ maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button className="btn-icon" onClick={closeDealModal} title="Back"><i className="fa fa-arrow-left" /></button>
                <h3>Create Deal</h3>
              </div>
              <button className="modal-close" onClick={closeDealModal} aria-label="Close">&times;</button>
            </div>

            <div className="form-body">
              <div className="form-group">
                <label className="form-label">Deal Name <span className="required">*</span></label>
                <input className={`form-control${dealErrors.name ? ' is-err' : ''}`} value={dealForm.name} onChange={(e) => setDeal('name', e.target.value)} />
                {dealErrors.name && <div className="form-error show">{dealErrors.name}</div>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Company <span className="required">*</span></label>
                  <input className={`form-control${dealErrors.company ? ' is-err' : ''}`} value={dealForm.company} onChange={(e) => setDeal('company', e.target.value)} />
                  {dealErrors.company && <div className="form-error show">{dealErrors.company}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Contact <span className="required">*</span></label>
                  <input className={`form-control${dealErrors.contact ? ' is-err' : ''}`} value={dealForm.contact} onChange={(e) => setDeal('contact', e.target.value)} />
                  {dealErrors.contact && <div className="form-error show">{dealErrors.contact}</div>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Deal Value (INR) <span className="required">*</span></label>
                  <input
                    className={`form-control${dealErrors.value ? ' is-err' : ''}`}
                    type="text"
                    inputMode="numeric"
                    value={dealForm.value}
                    onChange={(e) => setDeal('value', sanitizeDigits(e.target.value))}
                    onPaste={(e) => {
                      e.preventDefault();
                      setDeal('value', sanitizeDigits(e.clipboardData.getData('text')));
                    }}
                  />
                  {dealErrors.value && <div className="form-error show">{dealErrors.value}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Pipeline Stage</label>
                  <select className="form-control" value={dealForm.stage} onChange={(e) => setDeal('stage', e.target.value)}>
                    {DEAL_STAGES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Close Date <span className="required">*</span></label>
                  <input className={`form-control${dealErrors.closeDate ? ' is-err' : ''}`} type="date" value={dealForm.closeDate} onChange={(e) => setDeal('closeDate', e.target.value)} />
                  {dealErrors.closeDate && <div className="form-error show">{dealErrors.closeDate}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Win Probability (%)</label>
                  <input
                    className="form-control"
                    type="text"
                    inputMode="numeric"
                    value={dealForm.probability}
                    onChange={(e) => setDeal('probability', sanitizePercentage(e.target.value))}
                    onPaste={(e) => {
                      e.preventDefault();
                      setDeal('probability', sanitizePercentage(e.clipboardData.getData('text')));
                    }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Owner</label>
                <select className="form-control" value={dealForm.owner} onChange={(e) => setDeal('owner', e.target.value)}>
                  {OWNERS.map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>
            </div>

            <div className="form-actions">
              <button className="btn-secondary" onClick={closeDealModal}>Cancel</button>
              <button className="btn-primary" onClick={handleCreateDealFromContact}>
                <i className="fa fa-check" /> Save Deal
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <DeleteConfirm
          title="Delete Contact"
          message={`Are you sure you want to delete ${deleteTarget.name}? This action cannot be undone.`}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}

