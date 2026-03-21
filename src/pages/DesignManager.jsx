import { useRef, useState } from 'react';
import { useCRM } from '../context/CRMContext';

const FILES_AND_FOLDERS = [
  { id: 1, name: 'website-theme', type: 'folder', items: 12, lastModified: '2026-03-10' },
  { id: 2, name: 'email-templates', type: 'folder', items: 5, lastModified: '2026-02-28' },
  { id: 3, name: 'landing-page-v2', type: 'folder', items: 8, lastModified: '2026-03-12' },
  { id: 4, name: 'main.css', type: 'file', ext: 'css', size: '45 KB', lastModified: '2026-03-14' },
  { id: 5, name: 'header.js', type: 'file', ext: 'js', size: '12 KB', lastModified: '2026-03-15' },
  { id: 6, name: 'logo.png', type: 'file', ext: 'img', size: '250 KB', lastModified: '2026-01-20' },
];

const DESIGN_MANAGER_FILES_KEY = 'design_manager_files';

const readStoredFiles = () => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(DESIGN_MANAGER_FILES_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export default function DesignManager() {
  const { showToast } = useCRM();
  const fileInputRef = useRef(null);
  const [search, setSearch] = useState('');
  const [view, setView] = useState('list'); // 'list' or 'grid'
  const [files, setFiles] = useState(() => [...FILES_AND_FOLDERS, ...readStoredFiles()]);

  const handleFileSelect = (e) => {
    const selected = Array.from(e.target.files || []);
    if (!selected.length) return;

    const getType = (name) => {
      const ext = String(name || '').split('.').pop().toLowerCase();
      if (['css'].includes(ext)) return 'css';
      if (['js', 'jsx', 'ts', 'tsx'].includes(ext)) return 'js';
      if (['html', 'htm'].includes(ext)) return 'html';
      if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext)) return 'image';
      return 'other';
    };

    const getSize = (bytes) => {
      if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
      if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${bytes} B`;
    };

    const existing = readStoredFiles();
    const newFiles = selected.map((file) => ({
      id: `file_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: file.name,
      size: getSize(file.size),
      type: getType(file.name),
      modified: new Date().toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
      }),
      folderId: null,
      lastModified: new Date().toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
      }),
    }));

    const updated = [...existing, ...newFiles];
    localStorage.setItem(DESIGN_MANAGER_FILES_KEY, JSON.stringify(updated));
    setFiles([...FILES_AND_FOLDERS, ...updated]);

    const msg = newFiles.length === 1
      ? `"${newFiles[0].name}" uploaded successfully!`
      : `${newFiles.length} files uploaded successfully!`;
    showToast(msg);

    e.target.value = '';
  };

  const filtered = files.filter(f => {
    return !search || f.name.toLowerCase().includes(search.toLowerCase());
  });

  const getIcon = (item) => {
    if (item.type === 'folder') return 'fa-folder';
    if (item.type === 'css' || item.ext === 'css') return 'fa-file-code';
    if (item.type === 'js' || item.ext === 'js') return 'fa-file-code';
    if (item.type === 'html' || item.ext === 'html') return 'fa-file-code';
    if (item.type === 'image' || item.ext === 'img') return 'fa-file-image';
    return 'fa-file';
  };

  const getIconColor = (item) => {
    if (item.type === 'folder') return 'var(--warning)';
    if (item.type === 'css' || item.ext === 'css') return 'var(--info)';
    if (item.type === 'js' || item.ext === 'js') return 'var(--success)';
    if (item.type === 'html' || item.ext === 'html') return 'var(--success)';
    if (item.type === 'image' || item.ext === 'img') return 'var(--primary)';
    return 'var(--text-muted)';
  };

  return (
    <div className="page-fade design-manager-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Design Manager</h1>
          <p className="page-subtitle">Manage themes, templates, and assets</p>
        </div>
        <div className="design-manager-actions" style={{ display: 'flex', gap: 10 }}>
          <button className="btn-secondary" onClick={() => showToast('Creating a new folder...')}>
            <i className="fa fa-folder-plus"/> New Folder
          </button>
          <button className="btn-primary" onClick={() => fileInputRef.current?.click()}>
            <i className="fa fa-file-plus"/> Create File
          </button>
          <input
            type="file"
            multiple
            ref={fileInputRef}
            style={{ display: 'none' }}
            accept=".css,.js,.jsx,.ts,.tsx,.html,.htm,.png,.jpg,.jpeg,.gif,.svg,.webp,.pdf,.txt"
            onChange={handleFileSelect}
          />
        </div>
      </div>

      <div className="design-manager-layout">
        
        {/* Sidebar */}
        <div className="card design-manager-sidebar">
          <h3 className="design-manager-sidebar-title">File Browser</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <div className="design-manager-root-node">
              <i className="fa fa-folder-open" style={{ color: 'var(--warning)' }}></i> Root
            </div>
            
            <div className="design-manager-tree">
              {files.filter(f => f.type === 'folder').map(folder => (
                <div key={folder.id} className="design-manager-tree-node">
                  <i className="fa fa-folder" style={{ color: 'var(--warning)' }}></i> {folder.name}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Area */}
        <div className="card design-manager-main">
          <div className="card-toolbar design-manager-toolbar" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '15px' }}>
            <div className="search-box">
              <i className="fa fa-search"/>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search files…"/>
            </div>
            <div className="design-manager-view-toggle">
              <button 
                className={`btn-icon ${view === 'list' ? 'active' : ''}`} 
                onClick={() => setView('list')}
                style={{ background: view === 'list' ? 'var(--bg-hover)' : 'transparent' }}
              >
                <i className="fa fa-list"></i>
              </button>
              <button 
                className={`btn-icon ${view === 'grid' ? 'active' : ''}`} 
                onClick={() => setView('grid')}
                style={{ background: view === 'grid' ? 'var(--bg-hover)' : 'transparent' }}
              >
                <i className="fa fa-th-large"></i>
              </button>
            </div>
          </div>

          <div className="design-manager-content">
            {view === 'list' ? (
              <div className="table-container">
<table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Size/Items</th>
                    <th>Last Modified</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(f => (
                    <tr key={f.id} style={{ cursor: 'pointer' }} className="hover-row">
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                          <i className={`fa ${getIcon(f)}`} style={{ color: getIconColor(f), fontSize: '18px' }}></i>
                          <span className="fw-500">{f.name}</span>
                        </div>
                      </td>
                      <td className="txt-muted">{f.type === 'folder' ? `${f.items} items` : f.size}</td>
                      <td className="txt-sm txt-muted">{f.lastModified}</td>
                      <td>
                        <div className="action-btns">
                          <button className="btn-icon" onClick={() => showToast(`Editing ${f.name}`)}><i className="fa fa-pencil"/></button>
                          <button className="btn-icon" onClick={() => showToast(`More actions for ${f.name}`)}><i className="fa fa-ellipsis-v"/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
</div>
            ) : (
              <div className="design-manager-grid">
                {filtered.map(f => (
                  <div key={f.id} className="design-manager-grid-item hover-card">
                    <i className={`fa ${getIcon(f)}`} style={{ color: getIconColor(f), fontSize: '48px', marginBottom: '15px' }}></i>
                    <div className="fw-500" style={{ wordBreak: 'break-all' }}>{f.name}</div>
                    <div className="txt-sm txt-muted" style={{ marginTop: '5px' }}>
                      {f.type === 'folder' ? `${f.items} items` : f.size}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {!filtered.length && (
              <div className="empty-state" style={{ marginTop: '40px' }}>
                <i className="fa fa-folder-open"/><br/>No files or folders found
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
