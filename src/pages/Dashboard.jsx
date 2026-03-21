import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCRM } from '../context/CRMContext';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  ArcElement, Tooltip, Legend, Title
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend, Title);

/* ── all your original helpers — untouched ── */
function currency(n) { return '₹' + n.toLocaleString('en-IN'); }
function fmtDate(str) {
  return new Date(str).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
}
const AVATAR_COLORS = ['av-blue','av-gold','av-green','av-red','av-purple'];
function avatarColor(n) { return AVATAR_COLORS[n.charCodeAt(0) % AVATAR_COLORS.length]; }
function initials(n) { return n.split(' ').map(p=>p[0]).join('').toUpperCase().slice(0,2); }

const STAGE_CLASS = {
  'New Lead':'new','Contacted':'contacted','Proposal':'negotiation',
  'Negotiation':'negotiation','Closed Won':'won','Closed Lost':'lost',
};
const STAGE_BORDER = {
  'New Lead':'var(--info)','Contacted':'var(--warning)',
  'Proposal':'#8b5cf6','Negotiation':'#8b5cf6',
  'Closed Won':'var(--success)','Closed Lost':'var(--danger)',
};
const STAGE_COLOR = {
  'New Lead':'var(--info)','Contacted':'var(--warning)',
  'Proposal':'#8b5cf6','Negotiation':'#8b5cf6',
  'Closed Won':'var(--success)','Closed Lost':'var(--danger)',
};
const PIPELINE_STAGES = ['New Lead','Contacted','Proposal','Negotiation','Closed Won'];

const BAR_DATA = {
  labels: ['Jan','Feb','Mar','Apr','May','Jun'],
  datasets: [{
    data: [42, 58, 75, 90, 63, 88],
    backgroundColor: (ctx) => ctx.dataIndex === 2 ? 'rgba(212,160,23,0.9)' : 'rgba(26,60,107,0.75)',
    borderRadius: 6,
    borderSkipped: false,
  }],
};
const BAR_OPTIONS = {
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: {
    callbacks: { label: ctx => ` ₹${ctx.parsed.y} Lakhs` }
  }},
  scales: {
    y: { grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { callback: v => '₹' + v + 'L', font: { size: 11 } } },
    x: { grid: { display: false }, ticks: { font: { size: 11 } } },
  },
};

const DONUT_DATA = {
  labels: ['New Lead','Contacted','Negotiation','Closed Won','Closed Lost'],
  datasets: [{
    data: [25, 20, 18, 20, 17],
    backgroundColor: ['#3b82f6','#f59e0b','#8b5cf6','#22c55e','#ef4444'],
    borderWidth: 0,
    hoverOffset: 6,
  }],
};
const DONUT_OPTIONS = {
  responsive: true, maintainAspectRatio: false,
  cutout: '68%',
  plugins: {
    legend: { display: false },
    tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${ctx.parsed}%` } },
  },
};

/* ─────────────────────────────────────────────
   RESPONSIVE STYLES injected once at top level
   Uses a <style> tag so no CSS file changes needed
───────────────────────────────────────────── */
const RESPONSIVE_CSS = `
  /* ── Two-column flex row (Bootstrap-style) ── */
  .db-row {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    width: 100%;
    margin-bottom: 16px;
  }
  .db-col-6 {
    flex: 1 1 calc(50% - 8px);
    min-width: 0;           /* prevents overflow */
  }
  .db-col-8 {
    flex: 1 1 calc(60% - 8px);
    min-width: 0;
  }
  .db-col-4 {
    flex: 1 1 calc(40% - 8px);
    min-width: 0;
  }

  /* ── KPI grid ── */
  .db-kpi-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    width: 100%;
    margin-bottom: 16px;
  }

  /* ── Pipeline board horizontal scroll on small screens ── */
  .db-pipeline-scroll {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  .db-pipeline-inner {
    display: grid;
    grid-template-columns: repeat(5, minmax(180px, 1fr));
    gap: 12px;
    min-width: 900px;      /* keeps columns readable, scrolls on small */
  }

  /* ── Chart containers fill their card ── */
  .db-chart-bar  { height: 220px; width: 100%; }
  .db-chart-donut{ height: 220px; width: 100%; display: flex; align-items: center; justify-content: center; }

  /* ── Donut layout inside card ── */
  .db-donut-wrap {
    display: flex;
    align-items: center;
    gap: 24px;
    flex-wrap: wrap;
  }
  .db-donut-ring { flex-shrink: 0; position: relative; width: 130px; height: 130px; }
  .db-donut-center {
    position: absolute; inset: 0;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    pointer-events: none;
  }
  .db-donut-center .val { font-size: 22px; font-weight: 700; color: var(--text-primary, #111827); }
  .db-donut-center .lbl { font-size: 11px; color: var(--text-muted, #6b7280); }
  .db-donut-legend { flex: 1; min-width: 120px; }
  .db-donut-legend-item {
    display: flex; align-items: center; gap: 8px;
    padding: 5px 0;
    border-bottom: 1px solid var(--border, #e5e7eb);
    font-size: 13px;
  }
  .db-donut-legend-item:last-child { border-bottom: none; }
  .db-donut-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
  .db-donut-pct { margin-left: auto; font-weight: 600; color: var(--text-secondary, #374151); }

  /* ── Card fills its parent ── */
  .db-col-6 > .card,
  .db-col-8 > .card,
  .db-col-4 > .card {
    height: 100%;
    box-sizing: border-box;
  }

  /* ── Table wrapper ── */
  .db-table-wrap { overflow-x: auto; width: 100%; }

  /* ════════════════════════════════════════
     BREAKPOINTS
  ════════════════════════════════════════ */

  /* Tablet — 992px: 2 KPI cols, charts stack */
  @media (max-width: 992px) {
    .db-kpi-grid { grid-template-columns: repeat(2, 1fr); }
    .db-col-6,
    .db-col-8,
    .db-col-4 { flex: 1 1 100%; }
  }

  /* Mobile — 576px: 1 KPI col, single column everything */
  @media (max-width: 576px) {
    .db-kpi-grid { grid-template-columns: 1fr; }
    .db-col-6,
    .db-col-8,
    .db-col-4 { flex: 1 1 100%; }
    .db-chart-bar  { height: 180px; }
    .db-donut-wrap { flex-direction: column; align-items: flex-start; }
  }
`;

export default function Dashboard() {
  const { store, currentUser } = useCRM();
  const navigate  = useNavigate();
  const [year, setYear] = useState('2026');
  const firstName = currentUser?.name?.split(' ')[0] || 'Shailesh';

  const wonVal       = store.deals.filter(d => d.stage === 'Closed Won').reduce((a,b) => a + b.value, 0);
  const openDeals    = store.deals.filter(d => !['Closed Won','Closed Lost'].includes(d.stage)).length;
  const pendingTasks = store.tasks.filter(t => t.status !== 'Completed');
  const openTickets  = store.tickets.filter(t => t.status === 'Open').length;

  const TASK_ICON = { Call:'fa-phone', Email:'fa-envelope', Meeting:'fa-calendar', Document:'fa-file' };

  return (
    <div className="page-fade">

      {/* ── Inject responsive CSS once ── */}
      <style>{RESPONSIVE_CSS}</style>

      {/* ── Header — untouched ── */}
      <div className="page-header">
        <div>
          <div className="page-title">
            Welcome back, {firstName}{' '}
            <span className="material-symbols-rounded" style={{ verticalAlign:'middle', fontSize:24 }}>
              waving_hand
            </span>
          </div>
          <div className="page-subtitle">Here's what's happening with LegalEdge CRM today</div>
        </div>
        <div className="page-actions">
          <button className="btn-secondary" onClick={() => navigate('/reports')}>
            <i className="fa fa-chart-bar" /> View Reports
          </button>
          <button className="btn-primary" onClick={() => navigate('/contacts')}>
            <i className="fa fa-plus" /> Create New
          </button>
        </div>
      </div>

      {/* ── KPI Row 1 — 4-col grid, collapses to 2 then 1 ── */}
      <div className="db-kpi-grid">
        <div className="stat-card" onClick={() => navigate('/contacts')}>
          <div className="stat-icon blue"><i className="fa fa-address-book" /></div>
          <div className="stat-info">
            <div className="stat-label">Total Contacts</div>
            <div className="stat-value">{store.contacts.length}</div>
            <div className="stat-change up">↑ 12% this month</div>
          </div>
        </div>
        <div className="stat-card" onClick={() => navigate('/leads')}>
          <div className="stat-icon gold"><i className="fa fa-user-plus" /></div>
          <div className="stat-info">
            <div className="stat-label">Active Leads</div>
            <div className="stat-value">{store.leads.length}</div>
            <div className="stat-change up">↑ 8% this month</div>
          </div>
        </div>
        <div className="stat-card" onClick={() => navigate('/deals')}>
          <div className="stat-icon green"><i className="fa fa-handshake" /></div>
          <div className="stat-info">
            <div className="stat-label">Open Deals</div>
            <div className="stat-value">{openDeals}</div>
            <div className="stat-change up">↑ 5 new deals</div>
          </div>
        </div>
        <div className="stat-card" onClick={() => navigate('/deals')}>
          <div className="stat-icon gold"><i className="fa fa-indian-rupee-sign" /></div>
          <div className="stat-info">
            <div className="stat-label">Revenue (Won)</div>
            <div className="stat-value" style={{ fontSize:20 }}>{currency(wonVal)}</div>
            <div className="stat-change up">↑ 23% vs last month</div>
          </div>
        </div>
      </div>

      {/* ── KPI Row 2 ── */}
      <div className="db-kpi-grid">
        <div className="stat-card" onClick={() => navigate('/tasks')}>
          <div className="stat-icon info"><i className="fa fa-tasks" /></div>
          <div className="stat-info">
            <div className="stat-label">Pending Tasks</div>
            <div className="stat-value">{pendingTasks.length}</div>
            <div className="stat-change down">2 due today</div>
          </div>
        </div>
        <div className="stat-card" onClick={() => navigate('/tickets')}>
          <div className="stat-icon red"><i className="fa fa-ticket-alt" /></div>
          <div className="stat-info">
            <div className="stat-label">Open Tickets</div>
            <div className="stat-value">{openTickets}</div>
            <div className="stat-change down">1 high priority</div>
          </div>
        </div>
        <div className="stat-card" onClick={() => navigate('/companies')}>
          <div className="stat-icon blue"><i className="fa fa-building" /></div>
          <div className="stat-info">
            <div className="stat-label">Companies</div>
            <div className="stat-value">{store.companies.length}</div>
            <div className="stat-change up">↑ 2 new</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><i className="fa fa-percent" /></div>
          <div className="stat-info">
            <div className="stat-label">Win Rate</div>
            <div className="stat-value">68%</div>
            <div className="stat-change up">↑ 4% vs last quarter</div>
          </div>
        </div>
      </div>

      {/* ── Charts Row — 50 / 50 flex, stacks on tablet ── */}
      <div className="db-row">

        {/* LEFT — Monthly Revenue Bar Chart */}
        <div className="db-col-6">
          <div className="card" style={{ padding:24 }}>
            <div className="card-header" style={{ padding:0, border:0, marginBottom:16 }}>
              <div className="card-title">
                <i className="fa fa-chart-bar" style={{ color:'var(--primary)' }} /> Monthly Revenue
              </div>
              <select
                className="filter-select"
                style={{ minWidth:100 }}
                value={year}
                onChange={e => setYear(e.target.value)}
              >
                <option>2026</option>
                <option>2025</option>
              </select>
            </div>

            {/* Bar chart fills full card width */}
            <div className="db-chart-bar">
              <Bar data={BAR_DATA} options={BAR_OPTIONS} />
            </div>

            <div className="chart-legend" style={{ marginTop:12 }}>
              <div className="legend-item">
                <div className="legend-dot" style={{ background:'var(--primary)' }} />
                Revenue (₹ Lakhs)
              </div>
              <div className="legend-item">
                <div className="legend-dot" style={{ background:'var(--accent)' }} />
                Current Month
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT — Deal Pipeline by Stage + Leads Donut */}
        <div className="db-col-6">
          <div className="card" style={{ padding:24 }}>
            <div className="card-header" style={{ padding:0, border:0, marginBottom:8 }}>
              <h3 className="card-title">Deal Pipeline by Stage</h3>
            </div>
            <div className="card-header" style={{ padding:'0 0 16px', border:0 }}>
              <div className="card-title">
                <i className="fa fa-chart-pie" style={{ color:'var(--accent)' }} /> Leads by Status
              </div>
            </div>

            {/* Donut + legend side by side */}
            <div className="db-donut-wrap">
              <div className="db-donut-ring">
                <Doughnut data={DONUT_DATA} options={DONUT_OPTIONS} />
                <div className="db-donut-center">
                  <div className="val">{store.leads.length}</div>
                  <div className="lbl">Total</div>
                </div>
              </div>

              <div className="db-donut-legend">
                {[
                  ['New',         '#3b82f6', '25%'],
                  ['Contacted',   '#f59e0b', '20%'],
                  ['Qualified',   '#8b5cf6', '18%'],
                  ['Negotiation', '#22c55e', '20%'],
                ].map(([l, c, p]) => (
                  <div key={l} className="db-donut-legend-item">
                    <div className="db-donut-dot" style={{ background:c }} />
                    <span>{l}</span>
                    <span className="db-donut-pct">{p}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Row — Recent Leads + Upcoming Tasks ── */}
      <div className="db-row">

        {/* Recent Leads */}
        <div className="db-col-6">
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <i className="fa fa-user-plus" style={{ color:'var(--accent)' }} /> Recent Leads
              </div>
              <button
                className="btn-secondary"
                style={{ fontSize:12, padding:'6px 12px' }}
                onClick={() => navigate('/leads')}
              >
                View All
              </button>
            </div>
            <div className="card-body" style={{ padding:0 }}>
              <div className="db-table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Company</th>
                      <th>Status</th>
                      <th>Temp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {store.leads.slice(0,4).map(l => (
                      <tr key={l.id} style={{ cursor:'pointer' }} onClick={() => navigate('/leads')}>
                        <td>
                          <div className="contact-cell">
                            <div className={`avatar ${avatarColor(l.name)}`}>{initials(l.name)}</div>
                            <div className="contact-cell-info">
                              <b>{l.name}</b>
                              <span>{l.owner}</span>
                            </div>
                          </div>
                        </td>
                        <td>{l.company}</td>
                        <td>
                          <span className={`badge-status badge-${l.status.toLowerCase().replace(' ','-')}`}>
                            {l.status}
                          </span>
                        </td>
                        <td>
                          <span className={`badge-status badge-${l.temperature.toLowerCase()}`}>
                            {l.temperature}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className="db-col-6">
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <i className="fa fa-clock" style={{ color:'var(--warning)' }} /> Upcoming Tasks
              </div>
              <button
                className="btn-secondary"
                style={{ fontSize:12, padding:'6px 12px' }}
                onClick={() => navigate('/tasks')}
              >
                View All
              </button>
            </div>
            <div className="card-body" style={{ padding:0 }}>
              <ul className="activity-feed" style={{ padding:'0 16px' }}>
                {pendingTasks.slice(0,4).map(t => (
                  <li key={t.id} className="activity-item">
                    <div className="activity-icon" style={{ background:'rgba(26,60,107,0.1)' }}>
                      <i
                        className={`fa ${TASK_ICON[t.type] || 'fa-file'}`}
                        style={{ color:'var(--primary)' }}
                      />
                    </div>
                    <div className="activity-text">
                      <b>{t.title}</b>
                      <p>{t.related || t.owner}</p>
                    </div>
                    <div className="activity-time">
                      <span
                        className={`badge-status badge-${t.priority.toLowerCase()}`}
                        style={{ fontSize:10 }}
                      >
                        {t.priority}
                      </span>
                      <br />
                      <small>{fmtDate(t.dueDate)}</small>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* ── Pipeline Snapshot — horizontal scroll on small screens ── */}
      <div className="card" style={{ marginTop:0 }}>
        <div className="card-header">
          <div className="card-title">
            <i className="fa fa-stream" style={{ color:'var(--primary)' }} /> Deal Pipeline Snapshot
          </div>
          <button
            className="btn-primary"
            style={{ fontSize:12, padding:'6px 14px' }}
            onClick={() => navigate('/deals')}
          >
            Full Pipeline
          </button>
        </div>
        <div className="card-body">
          {/* Scrollable wrapper — 5 columns min 180px, scrolls on small screens */}
          <div className="db-pipeline-scroll">
            <div className="db-pipeline-inner">
              {PIPELINE_STAGES.map(stage => {
                const deals = store.deals.filter(d => d.stage === stage);
                const sc    = STAGE_CLASS[stage] || 'new';
                return (
                  <div key={stage} className={`pipeline-column stage-${sc}`}>
                    <div className="pipeline-col-header" style={{ borderColor: STAGE_BORDER[stage] }}>
                      <h4 style={{ color: STAGE_COLOR[stage] }}>{stage}</h4>
                      <span className="col-count">{deals.length}</span>
                    </div>
                    {deals.map(d => (
                      <div key={d.id} className="deal-card">
                        <div className="deal-card-title">{d.name}</div>
                        <div className="deal-card-company">{d.company}</div>
                        <div className="deal-card-value">{currency(d.value)}</div>
                        <div className="deal-card-footer">
                          <span className="deal-card-date">{fmtDate(d.closeDate)}</span>
                          <span style={{ fontSize:11, color:'var(--text-muted)' }}>{d.probability}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
