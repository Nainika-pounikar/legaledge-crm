import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCRM } from '../context/CRMContext';

const USERS = [
  { id: 1, name: 'Shailesh Bhange', role: 'admin', teamId: null },
  { id: 2, name: 'Arjun Mehta', role: 'manager', teamId: 'team_01' },
  { id: 3, name: 'Priya Sharma', role: 'user', teamId: 'team_01' },
  { id: 4, name: 'Rahul Singh', role: 'user', teamId: 'team_01' },
  { id: 5, name: 'Neha Verma', role: 'manager', teamId: 'team_02' },
  { id: 6, name: 'Aman Gupta', role: 'user', teamId: 'team_02' },
];

const ROLE_LABELS = {
  admin: 'Admin',
  manager: 'Manager',
  user: 'User',
};

export default function UserManagement() {
  const {
    currentUser, store, deleteRecord, updateRecord, showToast,
  } = useCRM();
  const navigate = useNavigate();
  const role = currentUser?.role;
  const [hiddenUserIds, setHiddenUserIds] = useState([]);
  const [editedStaticUsers, setEditedStaticUsers] = useState({});
  const [viewTarget, setViewTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', role: 'user', teamId: '' });

  const allUsers = useMemo(
    () => [...USERS, ...(store?.users || [])].map((u) => editedStaticUsers[u.id] || u),
    [store?.users, editedStaticUsers],
  );

  const visibleUsers = useMemo(() => {
    if (role === 'admin') return allUsers.filter((u) => !hiddenUserIds.includes(u.id));
    if (role === 'manager') {
      return allUsers.filter((u) => u.teamId === currentUser?.teamId && !hiddenUserIds.includes(u.id));
    }
    return [];
  }, [role, currentUser?.teamId, allUsers, hiddenUserIds]);

  const handleDeleteUser = (user) => {
    const dynamicUserExists = (store?.users || []).some((u) => u.id === user.id);

    if (dynamicUserExists) {
      deleteRecord('users', user.id);
    } else {
      setHiddenUserIds((prev) => [...prev, user.id]);
    }

    showToast('User deleted');
  };

  const openEditModal = (user) => {
    setEditTarget(user);
    setEditForm({
      name: user.name || '',
      role: user.role || 'user',
      teamId: user.teamId || '',
    });
  };

  const closeEditModal = () => {
    setEditTarget(null);
    setEditForm({ name: '', role: 'user', teamId: '' });
  };

  const handleUpdateUser = () => {
    if (!editTarget) return;
    if (!editForm.name.trim()) {
      showToast('Name is required', 'error');
      return;
    }

    const updated = {
      ...editTarget,
      name: editForm.name.trim(),
      role: editForm.role,
      teamId: editForm.role === 'admin' ? null : (editForm.teamId || null),
    };

    const dynamicUserExists = (store?.users || []).some((u) => u.id === editTarget.id);
    if (dynamicUserExists) {
      updateRecord('users', updated);
      setEditedStaticUsers((prev) => {
        if (!prev[editTarget.id]) return prev;
        const next = { ...prev };
        delete next[editTarget.id];
        return next;
      });
      showToast('User updated');
      closeEditModal();
      return;
    }

    setEditedStaticUsers((prev) => ({
      ...prev,
      [editTarget.id]: updated,
    }));
    showToast('User updated');
    closeEditModal();
  };

  if (role === 'user') {
    return (
      <div className="page-fade">
        <div className="card" style={{ padding: 20 }}>
          <h3 className="card-title" style={{ marginBottom: 8 }}>Profile Only Access</h3>
          <p className="txt-muted">Users can view only their own profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-fade">
      <div
        className="page-header"
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}
      >
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">
            {role === 'admin' ? 'View and manage all users' : 'View and manage your team users'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {role === 'admin' && (
            <button className="btn-secondary" onClick={() => navigate('/user')}>
              <i className="fa fa-user-shield" /> Add Admin
            </button>
          )}
          {role === 'admin' && (
            <button className="btn-secondary" onClick={() => navigate('/manager')}>
              <i className="fa fa-user-tie" /> Add Manager
            </button>
          )}
          {['admin', 'manager'].includes(role) && (
            <button className="btn-primary" onClick={() => navigate('/user')}>
              <i className="fa fa-user-plus" /> Add User
            </button>
          )}
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
          <thead>
            <tr style={{ background: 'var(--surface-2, #f8fafc)' }}>
              <th style={cellStyles.head}>Name</th>
              <th style={cellStyles.head}>Role</th>
              <th style={cellStyles.head}>Team</th>
              <th style={cellStyles.head}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {visibleUsers.map((u) => (
              <tr key={u.id} style={{ borderTop: '1px solid var(--border)' }}>
                <td style={cellStyles.value}>{u.name}</td>
                <td style={cellStyles.value}>{ROLE_LABELS[u.role] || u.role}</td>
                <td style={cellStyles.value}>{u.teamId || '-'}</td>
                <td style={cellStyles.value}>
                  {role === 'admin' && (
                    <div className="action-btns">
                      <button className="btn-icon" title="View" onClick={() => setViewTarget(u)}>
                        <i className="fa fa-eye" />
                      </button>
                      <button
                        className="btn-icon"
                        title="Update"
                        onClick={() => openEditModal(u)}
                      >
                        <i className="fa fa-pen" />
                      </button>
                      <button
                        className="btn-icon btn-icon-danger"
                        title="Delete"
                        onClick={() => handleDeleteUser(u)}
                      >
                        <i className="fa fa-trash" />
                      </button>
                    </div>
                  )}
                  {role === 'manager' && u.role === 'user' && (
                    <div className="action-btns">
                      <button className="btn-icon" title="View" onClick={() => setViewTarget(u)}>
                        <i className="fa fa-eye" />
                      </button>
                    </div>
                  )}
                  {role === 'manager' && u.role !== 'user' && <span className="txt-muted">-</span>}
                </td>
              </tr>
            ))}
            {visibleUsers.length === 0 && (
              <tr>
                <td colSpan={4} style={{ ...cellStyles.value, textAlign: 'center', padding: 24 }}>
                  No users available for this role.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {viewTarget && (
        <div className="modal-overlay show" onClick={(e) => { if (e.target.classList.contains('modal-overlay')) setViewTarget(null); }}>
          <div className="modal" style={{ maxWidth: 460 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>User Details</h3>
              <button className="modal-close" onClick={() => setViewTarget(null)} aria-label="Close">&times;</button>
            </div>
            <div className="form-body">
              <div className="form-group">
                <label className="form-label">Name</label>
                <input className="form-control" value={viewTarget.name || ''} readOnly />
              </div>
              <div className="form-group">
                <label className="form-label">Role</label>
                <input className="form-control" value={ROLE_LABELS[viewTarget.role] || viewTarget.role || ''} readOnly />
              </div>
              <div className="form-group">
                <label className="form-label">Team</label>
                <input className="form-control" value={viewTarget.teamId || '-'} readOnly />
              </div>
            </div>
            <div className="form-actions">
              <button className="btn-primary" onClick={() => setViewTarget(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {role === 'admin' && editTarget && (
        <div className="modal-overlay show" onClick={(e) => { if (e.target.classList.contains('modal-overlay')) closeEditModal(); }}>
          <div className="modal" style={{ maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Update User</h3>
              <button className="modal-close" onClick={closeEditModal} aria-label="Close">&times;</button>
            </div>
            <div className="form-body">
              <div className="form-group">
                <label className="form-label">Name</label>
                <input
                  className="form-control"
                  value={editForm.name}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Role</label>
                <select
                  className="form-control"
                  value={editForm.role}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, role: e.target.value }))}
                >
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="user">User</option>
                </select>
              </div>
              {editForm.role !== 'admin' && (
                <div className="form-group">
                  <label className="form-label">Team</label>
                  <input
                    className="form-control"
                    value={editForm.teamId}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, teamId: e.target.value }))}
                    placeholder="e.g. team_01"
                  />
                </div>
              )}
            </div>
            <div className="form-actions">
              <button className="btn-secondary" onClick={closeEditModal}>Cancel</button>
              <button className="btn-primary" onClick={handleUpdateUser}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const cellStyles = {
  head: {
    textAlign: 'left',
    padding: '12px 14px',
    fontSize: 13,
    fontWeight: 700,
    color: 'var(--text)',
    whiteSpace: 'nowrap',
  },
  value: {
    padding: '12px 14px',
    fontSize: 13,
    color: 'var(--text)',
    whiteSpace: 'nowrap',
  },
};
