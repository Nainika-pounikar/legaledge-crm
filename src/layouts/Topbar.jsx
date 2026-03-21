import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCRM } from '../context/CRMContext';
import './Topbar.css';
import SearchBar from '../components/SearchBar';
import { createPortal } from 'react-dom';
import { clearStoredAuth } from '../utils/auth';

// ── Breadcrumb map — synced with ALL routes in App.jsx ───────────────────────
const BREADCRUMBS = {
  '/':                    ['Home', 'Dashboard'],
  '/dashboards':          ['Reporting', 'Dashboards'],
  '/contacts':            ['CRM', 'Contacts'],
  '/companies':           ['CRM', 'Companies'],
  '/deals':               ['CRM', 'Deals'],
  '/tickets':             ['CRM', 'Tickets'],
  '/leads':               ['CRM', 'Leads'],
  '/segments':            ['CRM', 'Segments'],
  '/inbox':               ['CRM', 'Inbox'],
  '/calls':               ['CRM', 'Calls'],
  '/meetings':            ['CRM', 'Meetings'],
  '/tasks':               ['CRM', 'Tasks'],
  '/target-accounts':     ['CRM', 'Target Accounts'],
  '/helpdesk':            ['CRM', 'Help Desk'],
  '/reports':             ['Reporting', 'Reports'],
  '/sales-analytics':     ['Reporting', 'Sales Analytics'],
  '/commerce-analytics':  ['Reporting', 'Commerce Analytics'],
  '/service-analytics':   ['Reporting', 'Service Analytics'],
  '/goals':               ['Reporting', 'Goals'],
  '/forecast':            ['Sales', 'Forecast'],
  '/commerce-overview':   ['Commerce', 'Overview'],
  '/quotes':              ['Commerce', 'Quotes'],
  '/products':            ['Commerce', 'Products'],
  '/orders':              ['Commerce', 'Orders'],
  '/invoices':            ['Commerce', 'Invoices'],
  '/payments':            ['Commerce', 'Payments'],
  '/subscriptions':       ['Commerce', 'Subscriptions'],
  '/playbooks':           ['Sales Tools', 'Playbooks'],
  '/message-templates':   ['Sales Tools', 'Templates'],
  '/snippets':            ['Sales Tools', 'Snippets'],
  '/documents':           ['Sales Tools', 'Documents'],
  '/coaching-playlists':  ['Sales Tools', 'Coaching'],
  '/activity-feed':       ['Sales Tools', 'Activity Feed'],
  '/sequences':           ['Sales Tools', 'Sequences'],
  '/breeze-studio':       ['Breeze AI', 'Studio'],
  '/knowledge-vaults':    ['Breeze AI', 'Knowledge Vaults'],
  '/prospecting-agent':   ['Breeze AI', 'Prospecting Agent'],
  '/customer-agent':      ['Breeze AI', 'Customer Agent'],
  '/buyer-intent':        ['Breeze AI', 'Buyer Intent'],
  '/data-agent':          ['Data', 'Data Agent'],
  '/data-integration':    ['Data', 'Integration'],
  '/data-quality':        ['Data', 'Quality'],
  '/data-enrichment':     ['Data', 'Enrichment'],
  '/marketplace-apps':    ['Integrations', 'Marketplace'],
  '/breeze-marketplace':  ['Integrations', 'Breeze Marketplace'],
  '/connected-apps':      ['Integrations', 'Connected Apps'],
  '/blogs':               ['Content', 'Blogs'],
  '/seo':                 ['Content', 'SEO'],
  '/brand':               ['Content', 'Brand'],
  '/chat-flows':          ['Content', 'Chat Flows'],
  '/automation':          ['Operations', 'Automation'],
  '/campaigns':           ['Marketing', 'Campaigns'],
  '/email-marketing':     ['Marketing', 'Email Marketing'],
  '/social':              ['Marketing', 'Social Media'],
  '/forms':               ['Marketing', 'Forms'],
  '/lead-scoring':        ['Marketing', 'Lead Scoring'],
  '/events':              ['Marketing', 'Events'],
  '/sales-workspace':     ['Sales', 'Workspace'],
  '/knowledge-base':      ['Service', 'Knowledge Base'],
  '/feedback':            ['Service', 'Feedback'],
  '/website-pages':       ['Content', 'Website Pages'],
  '/landing-pages':       ['Content', 'Landing Pages'],
  '/videos':              ['Content', 'Videos'],
  '/podcasts':            ['Content', 'Podcasts'],
  '/case-studies':        ['Content', 'Case Studies'],
  '/design-manager':      ['Content', 'Design Manager'],
  '/data-model':          ['Settings', 'Data Model'],
  '/added-agents':        ['Settings', 'Added Agents'],
  '/settings':            ['Account', 'Settings'],
  '/profile':             ['Account', 'Profile'],
};

// ── Notifications data ───────────────────────────────────────────────────────
// FIX #4 — replaced FA Pro icons (fa-user-plus, fa-handshake) with FA Free equivalents
const NOTIFICATIONS = [
  { icon: 'fa-user',  title: 'New Lead Created', body: 'Rahul Sharma added as lead',            time: '2 min ago', unread: true, path: '/leads' },
  { icon: 'fa-check', title: 'Deal Updated',      body: 'Legal Suite deal moved to Negotiation', time: '1 hr ago',  unread: true, path: '/deals' },
  { icon: 'fa-clock', title: 'Task Due Today',    body: 'Follow-up call with Priya Mehta',       time: 'Today',     unread: true, path: '/tasks' },
];

// ── User helpers ──────────────────────────────────────────────────────────────────────────────────
const FALLBACK_USER = {
  name:   'Shailesh Bhange',
  role:   'Admin',
  avatar: 'SB',
};

const toInitials = (user) => {
  if (!user) return 'US';
  if (user.avatar) return user.avatar;
  if (!user.name) return 'US';
  return user.name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const normalizeRoleLabel = (role) => {
  if (!role) return 'User';
  return role.charAt(0).toUpperCase() + role.slice(1);
};

const getHomePath = (role) => {
  if (role === 'manager') return '/manager/dashboard';
  if (role === 'user') return '/user/dashboard';
  return '/admin/home';
};

// ── Component ────────────────────────────────────────────────────────────────
export default function Topbar({ onBreezeOpen, onCreateNew, onMobileMenu }) {
  const { pathname } = useLocation();
  const navigate     = useNavigate();
  const { currentUser, setCurrentUser } = useCRM();
  const activeUser = currentUser || FALLBACK_USER;
  const userInitials = toInitials(activeUser);
  const roleLabel = normalizeRoleLabel(activeUser.role);
  const roleClass = (activeUser.role || 'user').toLowerCase();
  const canCreate = roleClass === 'admin';
  const homePath = getHomePath(activeUser.role);

  // FIX #1 #2 — state for both dropdowns
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen,  setUserOpen]  = useState(false);

  // FIX #5 #6 — refs for click-outside detection on each dropdown wrapper
  const notifRef    = useRef(null);
const notifBtnRef = useRef(null);
  const userRef    = useRef(null);
const userBtnRef = useRef(null);

  useEffect(() => {
    function handleOutsideClick(e) {
      if (
        notifRef.current && !notifRef.current.contains(e.target) &&
        !document.querySelector('.notif-dropdown')?.contains(e.target)
      ) setNotifOpen(false);
      if (
        userRef.current && !userRef.current.contains(e.target) &&
        !document.querySelector('.user-menu')?.contains(e.target)
      ) setUserOpen(false);
    }
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // FIX #9 — closeAll closes BOTH dropdowns
  const closeAll = () => { setNotifOpen(false); setUserOpen(false); };

  const handleNotifClick = (path) => { navigate(path); closeAll(); };
  const handleLogout = () => {
    clearStoredAuth();
    setCurrentUser(null);
    closeAll();
    navigate('/login', { replace: true });
  };

  // FIX #7 — breadcrumb lookup with fallback for unknown routes
  const crumb = BREADCRUMBS[pathname.toLowerCase()] || ['Home', 'Dashboard'];
  const [parent, current] = crumb;

  const unreadCount = NOTIFICATIONS.filter(n => n.unread).length;

  return (
    /*
     * FIX #20 (ROOT CAUSE) — removed the duplicate `position: sticky` declaration
     * that was clobbering `position: relative`. The header now sits as sticky via
     * CSS only (one declaration), while the JS-driven dropdowns anchor correctly
     * because .topbar-icon-wrap has position:relative in the CSS.
     */
    <header className="topbar">

      {/* ── LEFT ─────────────────────────────────────────────────── */}
      <div className="topbar-left">
        <button className="topbar-hamburger" onClick={onMobileMenu} aria-label="Open menu">
          <i className="fa fa-bars" />
        </button>

        <SearchBar />

        {/* Call icons / Actions (Optional: could be moved to SearchBar or kept here) */}
        <div className="topbar-actions-group">
          <button
            className="topbar-action-btn"
            aria-label="Calls"
            onClick={() => navigate('/calls')}
          >
            <i className="fa fa-phone" />
          </button>

          <button
            className="topbar-action-btn"
            aria-label="Home"
            onClick={() => navigate(homePath)}
          >
            <i className="fa fa-home-alt" />
          </button>
        </div>
      </div>

      {/* ── RIGHT ────────────────────────────────────────────────── */}
      <div className="topbar-right">

        {/* FIX #3 — fa-sparkles (FA Pro) replaced with ✦ emoji */}
        <button
          className="breeze-topbar-btn"
          onClick={() => {
            if (onBreezeOpen) {
              onBreezeOpen();
              return;
            }
            document.querySelector('.bw-trigger')?.click();
          }}
          aria-label="Open Breeze AI"
        >
          <span className="breeze-icon"><i className="fa-solid fa-wand-magic-sparkles" /></span>
          <span className="topbar-btn-label">Breeze</span>
        </button>

        {/* Create New (Admin only) */}
        {canCreate && (
          <button className="btn-create" onClick={onCreateNew} aria-label="Create new">
            <i className="fa fa-plus" />
            <span className="topbar-btn-label">Create</span>
          </button>
        )}

        {/* ── Notifications ───────────────────────────────────────
         *  FIX #21 (ROOT CAUSE) — .topbar-icon-wrap now has position:relative
         *  in CSS so the absolutely-positioned .notif-dropdown anchors to it,
         *  not to the viewport. Previously the wrapper had no positioning context
         *  so the dropdown rendered off-screen / behind other elements.
         */}
        <div className="topbar-icon-wrap" ref={notifRef}>
          <button
            ref={notifBtnRef}
            className="topbar-icon"
            onClick={() => { setNotifOpen(p => !p); setUserOpen(false); }}
            aria-label="Notifications"
            aria-expanded={notifOpen}
            aria-haspopup="true"
          >
            <i className="fa fa-bell" />
            {unreadCount > 0 && (
              <span className="notif-badge" aria-label={`${unreadCount} unread notifications`}>
                {unreadCount}
              </span>
            )}
          </button>

          {/*
           * FIX #22 (ROOT CAUSE) — dropdown visibility is now driven by React
           * state toggling the `.show` class. The CSS was using opacity/visibility
           * transitions with `!important` which can conflict with any inline styles.
           * Keeping pure class-based toggling here; CSS handles the animation.
           */}
          </div>

        {createPortal(
          notifOpen ? (
            <div
              className="notif-dropdown show"
              style={{
                position: 'fixed',
                top:  (notifBtnRef.current?.getBoundingClientRect().bottom ?? 0) + 6 + 'px',
                right: (window.innerWidth - (notifBtnRef.current?.getBoundingClientRect().right ?? 0)) + 'px',
                zIndex: 9999,
              }}
              role="menu"
              aria-label="Notifications panel"
            >
              <div className="notif-header">
                <span>Notifications</span>
                <span className="notif-count">{unreadCount} new</span>
              </div>

              <div>
                {NOTIFICATIONS.map((n, i) => (
                  <div
                    key={i}
                    className={`notif-item${n.unread ? ' unread' : ''}`}
                    onClick={() => handleNotifClick(n.path)}
                    role="menuitem"
                    tabIndex={0}
                    onKeyDown={e => e.key === 'Enter' && handleNotifClick(n.path)}
                  >
                    <i className={`fa ${n.icon}`} />
                    <div>
                      <b>{n.title}</b>
                      <p>{n.body}</p>
                      <small>{n.time}</small>
                    </div>
                  </div>
                ))}
              </div>

              <div
                className="notif-footer"
                onClick={() => { navigate('/inbox'); closeAll(); }}
                role="menuitem"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && (() => { navigate('/inbox'); closeAll(); })()}
              >
                View all notifications →
              </div>
            </div>
          ) : null,
          document.body
        )}

        {/* ── Avatar + User Menu ──────────────────────────────────
         *  FIX #23 (ROOT CAUSE) — same positioning fix as notif wrapper.
         *  .topbar-icon-wrap has position:relative so .user-menu (position:absolute)
         *  anchors correctly relative to the avatar button, not the page.
         */}
       <div className="topbar-icon-wrap" ref={userRef}>
            <button
              ref={userBtnRef}
              className="topbar-avatar"
              onClick={() => { setUserOpen(p => !p); setNotifOpen(false); }}
              aria-label="User menu"
              aria-expanded={userOpen}
              aria-haspopup="true"
            >
              {userInitials}
            </button>
        </div>

        {createPortal(
          userOpen ? (
            <div
              className="user-menu show"
              style={{
                position: 'fixed',
                top: (userBtnRef.current?.getBoundingClientRect().bottom ?? 0) + 6 + 'px',
                right: (window.innerWidth - (userBtnRef.current?.getBoundingClientRect().right ?? 0)) + 'px',
                zIndex: 9999,
              }}
              role="menu"
              aria-label="User options"
            >
              <div className="user-menu-profile">
                <div className="user-avatar-sm">{userInitials}</div>
                <div className="user-menu-info">
                  <div className="user-menu-name">{activeUser.name}</div>
                  <div className={`user-role-badge role-${roleClass}`}>
                    {roleLabel}
                  </div>
                </div>
              </div>

              <div className="user-menu-divider" />

              <button className="user-menu-item" role="menuitem" onClick={() => { navigate('/profile'); closeAll(); }}>
                <i className="fa fa-user" /> My Profile
              </button>

              <button className="user-menu-item" role="menuitem" onClick={() => { navigate('/settings'); closeAll(); }}>
                <i className="fa fa-cog" /> Account Settings
              </button>

              {roleLabel === 'Admin' && (
                <button className="user-menu-item" role="menuitem" onClick={() => { navigate('/settings?tab=admin'); closeAll(); }}>
                  <i className="fa fa-tools" /> Admin Settings
                </button>
              )}

              {roleLabel === 'Manager' && (
                <button className="user-menu-item" role="menuitem" onClick={() => { navigate('/settings?tab=team'); closeAll(); }}>
                  <i className="fa fa-users" /> Team Settings
                </button>
              )}

              <div className="user-menu-divider" />

              <button className="user-menu-item user-menu-logout" role="menuitem" onClick={handleLogout}>
                <i className="fa fa-sign-out-alt" /> Log Out
              </button>
            </div>
          ) : null,
          document.body
        )}

      </div>
    </header>
  );
}
