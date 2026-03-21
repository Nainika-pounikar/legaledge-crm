import { useState } from 'react';
import { useCRM } from '../context/CRMContext';

const PAGES = [
  { id: 1, title: 'Home Page', url: '/', status: 'Published', views: 45200, lastUpdated: '2026-03-10' },
  { id: 2, title: 'About Us', url: '/about', status: 'Published', views: 12500, lastUpdated: '2026-02-15' },
  { id: 3, title: 'Pricing', url: '/pricing', status: 'Published', views: 32100, lastUpdated: '2026-03-01' },
  { id: 4, title: 'New Product Features', url: '/features-q1', status: 'Draft', views: 0, lastUpdated: '2026-03-15' },
  { id: 5, title: 'Contact Us', url: '/contact', status: 'Published', views: 8900, lastUpdated: '2026-01-20' },
];

export default function Webpages() {
  const { showToast } = useCRM();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  const rows = PAGES.filter(p => {
    const q = search.toLowerCase();
    const matchQ = !q || p.title.toLowerCase().includes(q) || p.url.toLowerCase().includes(q);
    const matchF = filter === 'All' || p.status === filter;
    return matchQ && matchF;
  });

  return (
    <div className="page-fade">
      <div className="page-header">
        <div>
          <h1 className="page-title">Website Pages</h1>
          <p className="page-subtitle">Manage and track your website pages</p>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <button className="btn-secondary" onClick={() => showToast('Website page settings opened')}>
            <i className="fa fa-cog"/> Settings
          </button>
          <button className="btn-primary" onClick={() => showToast('Page builder is coming soon.', 'info')}>
            <i className="fa fa-plus"/> Create Page
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-toolbar">
          <div className="search-box">
            <i className="fa fa-search"/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search pages…"/>
          </div>
          <div className="filter-tabs">
            {['All', 'Published', 'Draft', 'Archived'].map(f=>(
              <button key={f} className={`filter-tab${filter===f?' active':''}`} onClick={()=>setFilter(f)}>{f}</button>
            ))}
          </div>
        </div>

        <div className="table-responsive">
          <div className="table-container">
<table className="data-table">
            <thead>
              <tr>
                <th>Page Title</th>
                <th>URL Slug</th>
                <th>Status</th>
                <th>Views</th>
                <th>Last Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(p=>(
                <tr key={p.id}>
                  <td>
                    <div className="fw-600 color-primary">{p.title}</div>
                  </td>
                  <td className="txt-muted">{p.url}</td>
                  <td>
                    <span className={`badge badge-${p.status==='Published'?'success':p.status==='Draft'?'warning':'secondary'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <i className="fa fa-eye txt-muted"></i>
                      <span className="fw-500">{p.views.toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="txt-sm txt-muted">{p.lastUpdated}</td>
                  <td>
                    <div className="action-btns">
                      <button className="btn-icon" title="Edit" onClick={() => showToast(`Editing ${p.title}`)}><i className="fa-solid fa-pencil"/></button>
                      <button className="btn-icon" title="Preview" onClick={() => showToast(`Previewing ${p.title}`)}><i className="fa-solid fa-external-link-alt"/></button>
                      <button className="btn-icon" title="Analytics" onClick={() => showToast(`Opening analytics for ${p.title}`)}><i className="fa-solid fa-chart-line"/></button>
                    </div>
                  </td>
                </tr>
              ))}
              {!rows.length && (
                <tr><td colSpan={6} className="empty-state">
                  <i className="fa fa-globe"/><br/>No pages found
                </td></tr>
              )}
            </tbody>
          </table>
</div>
        </div>
      </div>
    </div>
  );
}
