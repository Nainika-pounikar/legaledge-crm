import { useState } from 'react';
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
  Pending: { bg: '#fef9c3', color: '#854d0e' },
  'In Progress': { bg: '#dbeafe', color: '#1d4ed8' },
  Completed: { bg: '#dcfce7', color: '#15803d' },
  Overdue: { bg: '#fee2e2', color: '#b91c1c' },
};

const TEAM_MEMBERS = [
  { id: 2, name: 'Arjun Mehta', role: 'Team Manager', leads: 124, tasksDue: 3, deals: 6, status: 'Active', teamId: 'team_01' },
  { id: 3, name: 'Priya Sharma', role: 'Sales Rep', leads: 96, tasksDue: 5, deals: 4, status: 'Active', teamId: 'team_01' },
  { id: 4, name: 'Rohan Verma', role: 'Sales Rep', leads: 78, tasksDue: 4, deals: 3, status: 'Away', teamId: 'team_01' },
  { id: 5, name: 'Neha Singh', role: 'BD Executive', leads: 44, tasksDue: 2, deals: 2, status: 'Active', teamId: 'team_02' },
  { id: 6, name: 'Aman Jha', role: 'Sales Rep', leads: 67, tasksDue: 6, deals: 5, status: 'Away', teamId: 'team_02' },
];

const TODAY_TASKS = [
  { id: 1, title: 'Follow up with Rahul Sharma', priority: 'High', due: '11:00 AM', overdue: true, assignedTo: 3, teamId: 'team_01', done: false },
  { id: 2, title: 'Send proposal to Vikram Nair', priority: 'High', due: '12:30 PM', overdue: false, assignedTo: 4, teamId: 'team_01', done: false },
  { id: 3, title: 'Review legal docs for Priya Desai', priority: 'Medium', due: '2:00 PM', overdue: false, assignedTo: 3, teamId: 'team_01', done: false },
  { id: 4, title: 'Update pipeline notes', priority: 'Low', due: '4:30 PM', overdue: false, assignedTo: 2, teamId: 'team_01', done: true },
  { id: 5, title: 'Call back Anita Kapoor', priority: 'High', due: '10:15 AM', overdue: true, assignedTo: 5, teamId: 'team_02', done: false },
];

const TEAM_LEADS = [
  { id: 1, name: 'Rahul Sharma', phone: '9876543210', status: 'New', assignedTo: 'Priya Sharma', assignedToId: 3, teamId: 'team_01', date: '15 Mar 2026' },
  { id: 2, name: 'Vikram Nair', phone: '9988776655', status: 'Qualified', assignedTo: 'Rohan Verma', assignedToId: 4, teamId: 'team_01', date: '15 Mar 2026' },
  { id: 3, name: 'Priya Desai', phone: '9123456780', status: 'Contacted', assignedTo: 'Priya Sharma', assignedToId: 3, teamId: 'team_01', date: '14 Mar 2026' },
  { id: 4, name: 'Anita Kapoor', phone: '9765432100', status: 'Won', assignedTo: 'Neha Singh', assignedToId: 5, teamId: 'team_02', date: '14 Mar 2026' },
  { id: 5, name: 'Suresh Pillai', phone: '9654321098', status: 'Lost', assignedTo: 'Aman Jha', assignedToId: 6, teamId: 'team_02', date: '13 Mar 2026' },
];

const PIPELINE_DATA = [
  { stage: 'Inquiry', count: 42, value: 620000, teamId: 'team_01' },
  { stage: 'Consultation', count: 31, value: 540000, teamId: 'team_01' },
  { stage: 'Retainer', count: 22, value: 470000, teamId: 'team_01' },
  { stage: 'Active', count: 18, value: 390000, teamId: 'team_01' },
  { stage: 'Closed Won', count: 11, value: 890000, teamId: 'team_01' },
  { stage: 'Inquiry', count: 16, value: 290000, teamId: 'team_02' },
  { stage: 'Consultation', count: 12, value: 210000, teamId: 'team_02' },
  { stage: 'Retainer', count: 9, value: 180000, teamId: 'team_02' },
  { stage: 'Active', count: 6, value: 140000, teamId: 'team_02' },
  { stage: 'Closed Won', count: 4, value: 260000, teamId: 'team_02' },
];

const FALLBACK_USER = {
  id: 2,
  name: 'Arjun Mehta',
  email: 'arjun@legaledge.in',
  role: 'manager',
  teamId: 'team_01',
  avatar: 'AM',
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

function statusDot(status) {
  return {
    width: 8,
    height: 8,
    borderRadius: '50%',
    display: 'inline-block',
    marginRight: 8,
    background: status === 'Active' ? 'var(--success)' : 'var(--warning)',
  };
}

export default function ManagerDashboard() {
  const { currentUser, showToast } = useCRM();
  const user = currentUser || FALLBACK_USER;
  const role = user?.role;

  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState(TODAY_TASKS);

  let visibleTeam = [];
  let visibleTasks = [];
  let visibleLeads = [];
  let visiblePipeline = [];

  try {
    visibleTeam = role === 'manager'
      ? TEAM_MEMBERS.filter((m) => m.teamId === user.teamId)
      : TEAM_MEMBERS.filter((m) => m.id === user.id);

    visibleTasks = role === 'manager'
      ? tasks.filter((t) => t.teamId === user.teamId)
      : tasks.filter((t) => t.assignedTo === user.id);

    visibleLeads = role === 'manager'
      ? TEAM_LEADS.filter((l) => l.teamId === user.teamId)
      : TEAM_LEADS.filter((l) => l.assignedToId === user.id);

    const base = role === 'manager'
      ? PIPELINE_DATA.filter((p) => p.teamId === user.teamId)
      : PIPELINE_DATA.filter((p) => p.teamId === user.teamId);

    visiblePipeline = ['Inquiry', 'Consultation', 'Retainer', 'Active', 'Closed Won'].map((stage) => {
      const rows = base.filter((r) => r.stage === stage);
      return {
        stage,
        count: rows.reduce((s, r) => s + r.count, 0),
        value: rows.reduce((s, r) => s + r.value, 0),
      };
    });
  } catch (err) {
    visibleTeam = [];
    visibleTasks = [];
    visibleLeads = [];
    visiblePipeline = [];
  }

  const teamLeadCount = visibleTeam.reduce((s, m) => s + m.leads, 0);
  const openDeals = visibleTeam.reduce((s, m) => s + m.deals, 0);
  const overdueCount = visibleTasks.filter((t) => t.overdue && !t.done).length;
  const wonCount = visibleLeads.filter((l) => l.status === 'Won').length;
  const conversion = visibleLeads.length ? Math.round((wonCount / visibleLeads.length) * 100) : 0;
  const maxPipeline = Math.max(1, ...visiblePipeline.map((p) => p.value));

  const toggleTask = (id) => {
    setLoading(true);
    try {
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
      showToast('Task status updated successfully!');
    } catch (err) {
      showToast('Unable to update task', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!['manager', 'user'].includes(role)) {
    return (
      <div className="page-fade">
        <div className="card" style={{ padding: 24 }}>
          <h3 className="card-title">Access Restricted</h3>
          <p className="txt-muted">You do not have permission to view this dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-fade manager-dashboard">
      <div className="page-header">
        <div>
          <h1 className="page-title">Manager Dashboard</h1>
          <p className="page-subtitle">Team performance overview and daily priorities</p>
        </div>
        <div className="page-actions manager-dashboard-actions" style={{ gap: 8 }}>
          {role === 'manager' && (
            <>
              <button className="btn-secondary" disabled={loading} onClick={() => showToast('Viewing team summary...')}>
                <i className="fa-solid fa-eye" /> View
              </button>
              <button className="btn-secondary" disabled={loading} onClick={() => showToast('Switching to edit mode...')}>
                <i className="fa-solid fa-pen" /> Edit
              </button>
            </>
          )}
          <button className="btn-secondary" disabled={loading} onClick={() => showToast('Dashboard refreshed successfully!')}>
            <i className="fa-solid fa-rotate" /> Refresh
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div className="card" style={{ padding: 16 }}>
          <div className="txt-muted txt-sm">Team Leads</div>
          <div className="page-title" style={{ fontSize: 28, marginTop: 4 }}>{teamLeadCount}</div>
          <div className="txt-success txt-sm"><i className="fa-solid fa-arrow-up" /> +24 this week</div>
        </div>
        <div className="card" style={{ padding: 16 }}>
          <div className="txt-muted txt-sm">Open Deals</div>
          <div className="page-title" style={{ fontSize: 28, marginTop: 4 }}>{inrShort(openDeals * 205000)}</div>
          <div className="txt-success txt-sm"><i className="fa-solid fa-arrow-up" /> +3 this week</div>
        </div>
        <div className="card" style={{ padding: 16 }}>
          <div className="txt-muted txt-sm">Tasks Overdue</div>
          <div className="page-title" style={{ fontSize: 28, marginTop: 4 }}>{overdueCount}</div>
          <div className="txt-danger txt-sm"><i className="fa-solid fa-triangle-exclamation" /> Needs attention</div>
        </div>
        <div className="card" style={{ padding: 16 }}>
          <div className="txt-muted txt-sm">Conversion Rate</div>
          <div className="page-title" style={{ fontSize: 28, marginTop: 4 }}>{conversion}%</div>
          <div className="txt-success txt-sm"><i className="fa-solid fa-arrow-up" /> Improved this month</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: 16, marginBottom: 24 }}>
        <div className="card" style={{ padding: 0 }}>
          <div className="page-header" style={{ marginBottom: 0, padding: '14px 16px' }}>
            <h3 className="card-title">My Team</h3>
          </div>
          {visibleTeam.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 48 }}>
              <i className="fa-solid fa-users" style={{ fontSize: 34, color: 'var(--text-light)' }} />
              <p className="txt-muted" style={{ marginTop: 10 }}>No team members available</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Leads</th>
                    <th>Tasks Due</th>
                    <th>Deals</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleTeam.map((m) => (
                    <tr key={m.id}>
                      <td>
                        <div className="fw-600">{m.name}</div>
                        <div className="txt-muted txt-sm">{m.role}</div>
                      </td>
                      <td>{m.leads}</td>
                      <td>{m.tasksDue}</td>
                      <td>{m.deals}</td>
                      <td><span style={statusDot(m.status)} />{m.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card" style={{ padding: 16 }}>
          <div className="page-header" style={{ marginBottom: 8 }}>
            <h3 className="card-title">Today's Priorities</h3>
          </div>

          {visibleTasks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <i className="fa-solid fa-list-check" style={{ fontSize: 34, color: 'var(--text-light)' }} />
              <p className="txt-muted" style={{ marginTop: 10 }}>No tasks assigned for today</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 10 }}>
              {visibleTasks.map((t) => (
                <div
                  key={t.id}
                  style={{
                    border: '1px solid var(--border)',
                    borderLeft: t.overdue && !t.done ? '4px solid var(--danger)' : '1px solid var(--border)',
                    borderRadius: 8,
                    padding: '10px 12px',
                    background: '#fff',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <label style={{ display: 'flex', gap: 10, alignItems: 'center', flex: 1 }}>
                    <input type="checkbox" checked={!!t.done} onChange={() => toggleTask(t.id)} disabled={loading} />
                    <span style={{ textDecoration: t.done ? 'line-through' : 'none' }}>{t.title}</span>
                  </label>
                  <span style={badge(t.priority)}>{t.priority}</span>
                  <span className="txt-muted txt-sm">{t.due}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: 16 }}>
        <div className="card" style={{ padding: 0 }}>
          <div className="page-header" style={{ marginBottom: 0, padding: '14px 16px' }}>
            <h3 className="card-title">Recent Team Leads</h3>
          </div>
          {visibleLeads.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 48 }}>
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
                    <th>Assigned</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleLeads.slice(0, 5).map((l) => (
                    <tr key={l.id}>
                      <td>{l.name}</td>
                      <td>{l.phone}</td>
                      <td><span style={badge(l.status)}>{l.status}</span></td>
                      <td>{l.assignedTo}</td>
                      <td>{l.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card" style={{ padding: 16 }}>
          <div className="page-header" style={{ marginBottom: 8 }}>
            <h3 className="card-title">Pipeline Overview</h3>
          </div>

          {visiblePipeline.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <i className="fa-solid fa-chart-simple" style={{ fontSize: 34, color: 'var(--text-light)' }} />
              <p className="txt-muted" style={{ marginTop: 10 }}>No pipeline data available</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 10 }}>
              {visiblePipeline.map((p, i) => {
                const width = Math.max(8, Math.round((p.value / maxPipeline) * 100));
                const opacity = Math.max(0.35, 1 - i * 0.12);
                return (
                  <div key={p.stage}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span className="fw-600">{p.stage}</span>
                      <span className="txt-muted txt-sm">{p.count} · {inrShort(p.value)}</span>
                    </div>
                    <div style={{ background: '#e5e7eb', borderRadius: 20, height: 10, overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${width}%`,
                          height: '100%',
                          background: `rgba(15, 36, 64, ${opacity})`,
                          borderRadius: 20,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

