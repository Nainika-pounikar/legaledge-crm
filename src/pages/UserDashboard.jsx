import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCRM } from '../context/CRMContext';

const STATUS_COLORS = {
  New: { bg: '#dbeafe', color: '#1d4ed8' },
  Contacted: { bg: '#fef9c3', color: '#854d0e' },
  Qualified: { bg: '#dcfce7', color: '#15803d' },
  Won: { bg: '#d1fae5', color: '#065f46' },
  Lost: { bg: '#fee2e2', color: '#b91c1c' },
  High: { bg: '#fee2e2', color: '#b91c1c' },
  Medium: { bg: '#fef9c3', color: '#854d0e' },
  Low: { bg: '#f3f4f6', color: '#374151' },
};

const MY_LEADS = [
  { id: 1, name: 'Rahul Sharma', phone: '9876543210', status: 'New', source: 'Referral', assignedTo: 3, teamId: 'team_01', date: '15 Mar 2026' },
  { id: 2, name: 'Priya Desai', phone: '9123456780', status: 'Contacted', source: 'Website', assignedTo: 3, teamId: 'team_01', date: '14 Mar 2026' },
  { id: 3, name: 'Vikram Nair', phone: '9988776655', status: 'Qualified', source: 'Ads', assignedTo: 4, teamId: 'team_01', date: '13 Mar 2026' },
  { id: 4, name: 'Anita Kapoor', phone: '9765432100', status: 'Won', source: 'Referral', assignedTo: 3, teamId: 'team_01', date: '12 Mar 2026' },
  { id: 5, name: 'Suresh Pillai', phone: '9654321098', status: 'Lost', source: 'Cold Call', assignedTo: 5, teamId: 'team_02', date: '11 Mar 2026' },
];

const MY_TASKS = [
  { id: 1, title: 'Follow-up call with Rahul', priority: 'High', due: '11:00 AM', linkedLead: 'Rahul Sharma', assignedTo: 3, teamId: 'team_01', done: false },
  { id: 2, title: 'Send retainer draft to Priya', priority: 'High', due: '2:00 PM', linkedLead: 'Priya Desai', assignedTo: 3, teamId: 'team_01', done: false },
  { id: 3, title: 'Update case notes - Anita', priority: 'Medium', due: '4:00 PM', linkedLead: 'Anita Kapoor', assignedTo: 3, teamId: 'team_01', done: true },
  { id: 4, title: 'Confirm meeting slot', priority: 'Low', due: '5:30 PM', linkedLead: 'Vikram Nair', assignedTo: 4, teamId: 'team_01', done: false },
  { id: 5, title: 'Prepare handover notes', priority: 'Medium', due: '6:30 PM', linkedLead: 'Suresh Pillai', assignedTo: 5, teamId: 'team_02', done: false },
];

const ACTIVITY = [
  { id: 1, type: 'update', text: 'You updated Rahul Sharma -> Qualified', time: '2 hrs ago', userId: 3 },
  { id: 2, type: 'add', text: 'You added lead Priya Desai', time: '3 hrs ago', userId: 3 },
  { id: 3, type: 'complete', text: 'You completed task Update case notes - Anita', time: '5 hrs ago', userId: 3 },
  { id: 4, type: 'call', text: 'You called Rahul Sharma (12m)', time: 'Yesterday', userId: 3 },
  { id: 5, type: 'mail', text: 'You emailed Priya Desai proposal', time: 'Yesterday', userId: 3 },
  { id: 6, type: 'add', text: 'You added lead Vikram Nair', time: '2 days ago', userId: 4 },
];

const FALLBACK_USER = {
  id: 3,
  name: 'Priya Sharma',
  email: 'priya@legaledge.in',
  role: 'user',
  teamId: 'team_01',
  avatar: 'PS',
};

function inrShort(n) {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  return `₹${n.toLocaleString('en-IN')}`;
}

function badge(status) {
  const c = STATUS_COLORS[status] || { bg: '#f3f4f6', color: '#374151' };
  return {
    padding: '3px 10px',
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
    background: c.bg,
    color: c.color,
    whiteSpace: 'nowrap',
  };
}

function activityIcon(type) {
  const map = {
    update: { icon: 'fa-pen', color: '#2563eb' },
    add: { icon: 'fa-plus', color: '#16a34a' },
    complete: { icon: 'fa-check', color: '#22c55e' },
    call: { icon: 'fa-phone', color: '#f59e0b' },
    mail: { icon: 'fa-envelope', color: '#7c3aed' },
  };
  return map[type] || { icon: 'fa-circle', color: '#64748b' };
}

export default function UserDashboard() {
  const { currentUser, showToast } = useCRM();
  const user = currentUser || FALLBACK_USER;
  const role = user?.role;

  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState(MY_TASKS);

  let visibleLeads = [];
  let visibleTasks = [];
  let visibleActivity = [];

  try {
    visibleLeads = MY_LEADS.filter((l) => l.assignedTo === user.id);
    visibleTasks = tasks.filter((t) => t.assignedTo === user.id);
    visibleActivity = ACTIVITY.filter((a) => a.userId === user.id).slice(0, 10);
  } catch (err) {
    visibleLeads = [];
    visibleTasks = [];
    visibleActivity = [];
  }

  const dueToday = visibleTasks.filter((t) => !t.done).length;
  const overdue = visibleTasks.filter((t) => t.priority === 'High' && !t.done).length;
  const openDealsValue = visibleLeads
    .filter((l) => ['New', 'Contacted', 'Qualified'].includes(l.status))
    .reduce((s) => s + 40000, 0);

  const toggleTask = (id) => {
    setLoading(true);
    try {
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
      showToast('Task updated successfully!');
    } catch (err) {
      showToast('Unable to update task', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (role !== 'user') {
    return (
      <div className="page-fade">
        <div className="card" style={{ padding: 24 }}>
          <h3 className="card-title">Access Restricted</h3>
          <p className="txt-muted">This dashboard is available for user role only.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-fade">
      <div className="page-header">
        <div>
          <h1 className="page-title">User Dashboard</h1>
          <p className="page-subtitle">Your leads, tasks, and recent activity at a glance</p>
        </div>
        <button className="btn-secondary" disabled={loading} onClick={() => showToast('Dashboard refreshed successfully!')}>
          <i className="fa-solid fa-rotate" /> Refresh
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div className="card" style={{ padding: 16 }}>
          <div className="txt-muted txt-sm">My Leads</div>
          <div className="page-title" style={{ fontSize: 28, marginTop: 4 }}>{visibleLeads.length}</div>
          <div className="txt-success txt-sm">12 new this week</div>
        </div>
        <div className="card" style={{ padding: 16 }}>
          <div className="txt-muted txt-sm">Tasks Due Today</div>
          <div className="page-title" style={{ fontSize: 28, marginTop: 4 }}>{dueToday}</div>
          <div className="txt-danger txt-sm">{overdue} high priority pending</div>
        </div>
        <div className="card" style={{ padding: 16 }}>
          <div className="txt-muted txt-sm">My Open Deals</div>
          <div className="page-title" style={{ fontSize: 28, marginTop: 4 }}>{inrShort(openDealsValue || 240000)}</div>
          <div className="txt-success txt-sm">6 active opportunities</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div className="card" style={{ padding: 16 }}>
          <div className="page-header" style={{ marginBottom: 8 }}>
            <h3 className="card-title">My Tasks Today</h3>
          </div>

          {visibleTasks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <i className="fa-solid fa-list-check" style={{ fontSize: 34, color: 'var(--text-light)' }} />
              <p className="txt-muted" style={{ marginTop: 10 }}>No tasks assigned today</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 10 }}>
              {visibleTasks.map((t) => (
                <div key={t.id} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
                      <input type="checkbox" checked={!!t.done} onChange={() => toggleTask(t.id)} disabled={loading} />
                      <span style={{ textDecoration: t.done ? 'line-through' : 'none' }}>{t.title}</span>
                    </label>
                    <span style={badge(t.priority)}>{t.priority}</span>
                  </div>
                  <div className="txt-muted txt-sm" style={{ marginTop: 6 }}>{t.due} · {t.linkedLead}</div>
                </div>
              ))}
              <Link to="/tasks" className="txt-muted" style={{ fontWeight: 600, textDecoration: 'none' }}>View All Tasks {'->'}</Link>
            </div>
          )}
        </div>

        <div className="card" style={{ padding: 0 }}>
          <div className="page-header" style={{ marginBottom: 0, padding: '14px 16px' }}>
            <h3 className="card-title">My Recent Leads</h3>
          </div>

          {visibleLeads.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <i className="fa-solid fa-address-book" style={{ fontSize: 34, color: 'var(--text-light)' }} />
              <p className="txt-muted" style={{ marginTop: 10 }}>No leads available</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleLeads.slice(0, 5).map((lead) => (
                    <tr key={lead.id}>
                      <td>{lead.name}</td>
                      <td>{lead.phone}</td>
                      <td><span style={badge(lead.status)}>{lead.status}</span></td>
                      <td>{lead.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ padding: '10px 16px' }}>
                <Link to="/leads" className="txt-muted" style={{ fontWeight: 600, textDecoration: 'none' }}>View All Leads {'->'}</Link>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="card" style={{ padding: 16 }}>
        <div className="page-header" style={{ marginBottom: 8 }}>
          <h3 className="card-title">My Activity This Week</h3>
        </div>

        {visibleActivity.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <i className="fa-solid fa-clock-rotate-left" style={{ fontSize: 34, color: 'var(--text-light)' }} />
            <p className="txt-muted" style={{ marginTop: 10 }}>No activity found</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 10 }}>
            {visibleActivity.map((a) => {
              const icon = activityIcon(a.type);
              return (
                <div key={a.id} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
                  <div style={{ width: 26, height: 26, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${icon.color}22`, color: icon.color }}>
                    <i className={`fa-solid ${icon.icon}`} style={{ fontSize: 12 }} />
                  </div>
                  <div style={{ flex: 1 }}>{a.text}</div>
                  <div className="txt-muted txt-sm">{a.time}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}


