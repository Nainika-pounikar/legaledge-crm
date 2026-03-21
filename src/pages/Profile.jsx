import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCRM } from '../context/CRMContext';
import {
  PHONE_ERROR,
  REQUIRED_ERROR,
  isValidEmail,
  isValidPhone,
  required,
  sanitizePhone,
} from '../utils/formValidation';

const TAB_ITEMS = [
  ['profile', 'fa-user', 'Profile'],
  ['preferences', 'fa-sliders', 'Preferences'],
  ['notifications', 'fa-bell', 'Notifications'],
  ['security', 'fa-lock', 'Security'],
  ['integrations', 'fa-plug', 'Integrations'],
];

const ACTION_BUTTON_STYLE = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  backgroundColor: 'var(--primary)',
  color: '#ffffff',
  border: '1px solid var(--primary)',
  padding: '8px 16px',
  borderRadius: '6px',
  fontSize: '14px',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'opacity 0.2s',
};

const initialApps = [
  { id: 'google-calendar', name: 'Google Calendar', connected: true },
  { id: 'outlook', name: 'Outlook', connected: false },
  { id: 'slack', name: 'Slack', connected: true },
  { id: 'zoom', name: 'Zoom', connected: false },
];

function ToggleRow({ label, hint, checked, onChange }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 0',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div>
        <div style={{ fontWeight: 600, color: 'var(--text)' }}>{label}</div>
        {hint && <div className="txt-muted txt-sm">{hint}</div>}
      </div>

      <label className="toggle-switch" aria-label={label}>
        <input type="checkbox" checked={checked} onChange={onChange} />
        <span className="toggle-slider" />
      </label>
    </div>
  );
}

export default function Settings() {
  const { showToast, currentUser } = useCRM();
  const navigate = useNavigate();
  const role = currentUser?.role;

  const [profile, setProfile] = useState({
    name: currentUser?.name || 'Shailesh Bhange',
    email: currentUser?.email || 'shailesh@legaledge.in',
    phone: '9876543210',
    role: toRoleLabel(currentUser?.role),
    company: 'LegalEdge India',
    timezone: 'Asia/Kolkata',
  });

  const [prefs, setPrefs] = useState({
    emailNotif: true,
    taskReminders: true,
    dealAlerts: true,
    weeklyReport: true,
    darkMode: false,
    compactView: false,
    defaultLanding: '/dashboards',
  });

  const [security, setSecurity] = useState({
    twoFactor: true,
    loginAlerts: true,
    sessionTimeout: '30',
  });

  const [apps, setApps] = useState(initialApps);
  const [tab, setTab] = useState('profile');
  const [errors, setErrors] = useState({});
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetStep, setResetStep] = useState(1);
  const [resetForm, setResetForm] = useState({
    email: '',
    phone: '',
    otp: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [resetErrors, setResetErrors] = useState({});

  const validate = (data) => {
    const errs = {};
    if (!required(data.name)) errs.name = REQUIRED_ERROR;
    if (!required(data.email)) errs.email = REQUIRED_ERROR;
    else if (!isValidEmail(data.email)) errs.email = 'Enter valid email address';
    if (!required(data.phone)) errs.phone = REQUIRED_ERROR;
    else if (!isValidPhone(data.phone)) errs.phone = PHONE_ERROR;
    if (!required(data.role)) errs.role = REQUIRED_ERROR;
    if (!required(data.company)) errs.company = REQUIRED_ERROR;
    if (!required(data.timezone)) errs.timezone = REQUIRED_ERROR;
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveProfile = () => {
    if (validate(profile)) {
      showToast('Profile updated successfully!');
    } else {
      showToast('Please fix the errors in your profile.', 'error');
    }
  };

  const handleSavePreferences = () => showToast('Preferences updated successfully!');
  const handleSaveNotifications = () => showToast('Notification settings updated successfully!');
  const handleSaveSecurity = () => showToast('Security settings updated successfully!');

  const togglePref = (k) => setPrefs((p) => ({ ...p, [k]: !p[k] }));
  const toggleSecurity = (k) => setSecurity((p) => ({ ...p, [k]: !p[k] }));

  const openResetPasswordModal = () => {
    setResetStep(1);
    setResetErrors({});
    setResetForm({
      email: profile.email || '',
      phone: sanitizePhone(profile.phone || ''),
      otp: '',
      newPassword: '',
      confirmPassword: '',
    });
    setResetModalOpen(true);
  };

  const closeResetPasswordModal = () => {
    setResetModalOpen(false);
    setResetStep(1);
    setResetErrors({});
  };

  const setResetField = (key, value) => {
    setResetForm((prev) => ({ ...prev, [key]: value }));
    setResetErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const handleSendOtp = () => {
    const errs = {};
    if (!required(resetForm.email)) errs.email = REQUIRED_ERROR;
    else if (!isValidEmail(resetForm.email)) errs.email = 'Enter valid email address';
    if (!required(resetForm.phone)) errs.phone = REQUIRED_ERROR;
    else if (!isValidPhone(resetForm.phone)) errs.phone = PHONE_ERROR;

    if (Object.keys(errs).length) {
      setResetErrors(errs);
      return;
    }

    setResetStep(2);
    showToast('OTP sent successfully.');
  };

  const handleVerifyOtp = () => {
    const errs = {};
    if (!required(resetForm.otp)) errs.otp = REQUIRED_ERROR;
    else if (resetForm.otp.length !== 6) errs.otp = 'Enter valid 6 digit OTP';

    if (Object.keys(errs).length) {
      setResetErrors(errs);
      return;
    }

    setResetStep(3);
    showToast('OTP verified successfully.');
  };

  const handlePasswordReset = () => {
    const errs = {};
    if (!required(resetForm.newPassword)) errs.newPassword = REQUIRED_ERROR;
    if (!required(resetForm.confirmPassword)) errs.confirmPassword = REQUIRED_ERROR;
    else if (resetForm.newPassword !== resetForm.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(errs).length) {
      setResetErrors(errs);
      return;
    }

    closeResetPasswordModal();
    showToast('Password reset successfully!');
  };

  const toggleIntegration = (id) => {
    setApps((prev) => {
      const next = prev.map((app) =>
        app.id === id ? { ...app, connected: !app.connected } : app,
      );
      const changed = next.find((a) => a.id === id);
      showToast(`${changed?.name} ${changed?.connected ? 'connected' : 'disconnected'} successfully!`);
      return next;
    });
  };

  return (
    <div className="page-fade">
      <div
        className="page-header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
        }}
      >
        <div style={{ flex: 1 }}>
          <h1 className="page-title" style={{ margin: 0 }}>Profile</h1>
          <p className="page-subtitle" style={{ margin: 0 }}>Manage your profile and preferences</p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          {role === 'admin' && (
            <button className="btn-custom" onClick={() => navigate('/user')} style={ACTION_BUTTON_STYLE}>
              <i className="fa fa-user-shield" />
              Add Admin
            </button>
          )}
          {role === 'admin' && (
            <button className="btn-custom" onClick={() => navigate('/manager')} style={ACTION_BUTTON_STYLE}>
              <i className="fa fa-user-tie" />
              Add Manager
            </button>
          )}
          {['admin', 'manager'].includes(role) && (
            <button className="btn-custom" onClick={() => navigate('/user')} style={ACTION_BUTTON_STYLE}>
              <i className="fa fa-user-plus" />
              Add User
            </button>
          )}
          {['admin', 'manager'].includes(role) && (
            <button className="btn-custom" onClick={() => navigate('/user-management')} style={ACTION_BUTTON_STYLE}>
              <i className="fa fa-users" />
              View Users
            </button>
          )}
        </div>
      </div>
      {role === 'user' && (
        <div className="card" style={{ marginBottom: 16, padding: 16 }}>
          <span className="txt-muted">Profile Only Access</span>
        </div>
      )}

      <div className="settings-grid">
        <div className="settings-nav">
          {TAB_ITEMS.map(([k, ic, lbl]) => (
            <div
              key={k}
              className={`settings-nav-item${tab === k ? ' active' : ''}`}
              onClick={() => setTab(k)}
            >
              <i className={`fa ${ic}`} /> {lbl}
            </div>
          ))}
        </div>

        <div className="card" style={{ padding: 24 }}>
          {tab === 'profile' && (
            <div>
              <h3 className="card-title" style={{ marginBottom: 16 }}>Profile Information</h3>
              <div
                className="form-grid"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: 16,
                }}
              >
                {[
                  ['name', 'Full Name', 'text'],
                  ['email', 'Email', 'email'],
                  ['phone', 'Phone', 'tel'],
                  ['role', 'Role', 'text'],
                  ['company', 'Company', 'text'],
                  ['timezone', 'Timezone', 'text'],
                ].map(([f, l, t]) => (
                  <div key={f} className="form-group">
                    <label className="form-label">{l}</label>
                    <input
                      type={t}
                      className={`form-control${errors[f] ? ' is-err' : ''}`}
                      value={profile[f]}
                      onChange={(e) =>
                        setProfile((p) => ({
                          ...p,
                          [f]: f === 'phone' ? sanitizePhone(e.target.value) : e.target.value,
                        }))
                      }
                      onPaste={
                        f === 'phone'
                          ? (e) => {
                              e.preventDefault();
                              setProfile((p) => ({ ...p, phone: sanitizePhone(e.clipboardData.getData('text')) }));
                            }
                          : undefined
                      }
                      inputMode={f === 'phone' ? 'numeric' : undefined}
                      maxLength={f === 'phone' ? 10 : undefined}
                    />
                    {errors[f] && <span className="form-error show">{errors[f]}</span>}
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn-primary" onClick={handleSaveProfile}>
                  <i className="fa fa-save" /> Save Changes
                </button>
              </div>
            </div>
          )}

          {tab === 'preferences' && (
            <div>
              <h3 className="card-title" style={{ marginBottom: 6 }}>Preferences</h3>
              <p className="txt-muted" style={{ marginBottom: 12 }}>Customize workspace behavior and defaults.</p>

              <div className="form-group" style={{ marginBottom: 12 }}>
                <label className="form-label">Default Landing Page</label>
                <select
                  className="form-control"
                  value={prefs.defaultLanding}
                  onChange={(e) => setPrefs((p) => ({ ...p, defaultLanding: e.target.value }))}
                >
                  <option value="/dashboards">Dashboard</option>
                  <option value="/contacts">Contacts</option>
                  <option value="/deals">Deals</option>
                  <option value="/tasks">Tasks</option>
                </select>
              </div>

              <ToggleRow
                label="Compact View"
                hint="Use tighter spacing in tables and cards."
                checked={prefs.compactView}
                onChange={() => togglePref('compactView')}
              />
              <ToggleRow
                label="Dark Mode"
                hint="Enable dark theme for low-light environments."
                checked={prefs.darkMode}
                onChange={() => togglePref('darkMode')}
              />

              <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn-primary" onClick={handleSavePreferences}>
                  <i className="fa fa-save" /> Save Preferences
                </button>
              </div>
            </div>
          )}

          {tab === 'notifications' && (
            <div>
              <h3 className="card-title" style={{ marginBottom: 6 }}>Notifications</h3>
              <p className="txt-muted" style={{ marginBottom: 12 }}>Control which updates you receive from the CRM.</p>

              <ToggleRow
                label="Email Notifications"
                hint="Get key CRM activity updates by email."
                checked={prefs.emailNotif}
                onChange={() => togglePref('emailNotif')}
              />
              <ToggleRow
                label="Task Reminders"
                hint="Send reminders before task due times."
                checked={prefs.taskReminders}
                onChange={() => togglePref('taskReminders')}
              />
              <ToggleRow
                label="Deal Alerts"
                hint="Notify when stages change or deals close."
                checked={prefs.dealAlerts}
                onChange={() => togglePref('dealAlerts')}
              />
              <ToggleRow
                label="Weekly Summary Report"
                hint="Receive performance summary every week."
                checked={prefs.weeklyReport}
                onChange={() => togglePref('weeklyReport')}
              />

              <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn-primary" onClick={handleSaveNotifications}>
                  <i className="fa fa-save" /> Save Notifications
                </button>
              </div>
            </div>
          )}

          {tab === 'security' && (
            <div>
              <h3 className="card-title" style={{ marginBottom: 6 }}>Security</h3>
              <p className="txt-muted" style={{ marginBottom: 12 }}>Protect account access and login activity.</p>

              <ToggleRow
                label="Two-Factor Authentication"
                hint="Require a second verification step at login."
                checked={security.twoFactor}
                onChange={() => toggleSecurity('twoFactor')}
              />
              <ToggleRow
                label="Login Alerts"
                hint="Get alerted on new or unusual login events."
                checked={security.loginAlerts}
                onChange={() => toggleSecurity('loginAlerts')}
              />

              <div className="form-group" style={{ marginTop: 12 }}>
                <label className="form-label">Session Timeout (minutes)</label>
                <select
                  className="form-control"
                  value={security.sessionTimeout}
                  onChange={(e) => setSecurity((s) => ({ ...s, sessionTimeout: e.target.value }))}
                >
                  <option value="15">15</option>
                  <option value="30">30</option>
                  <option value="60">60</option>
                </select>
              </div>

              <div style={{ marginTop: 20, display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                <button className="btn-secondary" onClick={openResetPasswordModal}>Reset Password</button>
                <button className="btn-secondary" onClick={() => showToast('Login history opened.')}>View Login History</button>
                <button className="btn-primary" onClick={handleSaveSecurity}>
                  <i className="fa fa-save" /> Save Security
                </button>
              </div>
            </div>
          )}

          {tab === 'integrations' && (
            <div>
              <h3 className="card-title" style={{ marginBottom: 6 }}>Integrations</h3>
              <p className="txt-muted" style={{ marginBottom: 12 }}>Manage connected tools and account access.</p>

              <div style={{ display: 'grid', gap: 10 }}>
                {apps.map((app) => (
                  <div
                    key={app.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      border: '1px solid var(--border)',
                      borderRadius: 10,
                      padding: '12px 14px',
                      background: 'var(--card-bg)',
                    }}
                  >
                    <div>
                      <div className="fw-600">{app.name}</div>
                      <div className="txt-sm" style={{ color: app.connected ? 'var(--success)' : 'var(--text-muted)' }}>
                        {app.connected ? 'Connected' : 'Not Connected'}
                      </div>
                    </div>

                    <button
                      className={app.connected ? 'btn-secondary' : 'btn-primary'}
                      onClick={() => toggleIntegration(app.id)}
                    >
                      {app.connected ? 'Disconnect' : 'Connect'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {resetModalOpen && (
        <div
          className="modal-overlay show"
          onClick={(e) => {
            if (e.target.classList.contains('modal-overlay')) closeResetPasswordModal();
          }}
        >
          <div className="modal" style={{ maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {resetStep > 1 && (
                  <button
                    className="btn-icon"
                    onClick={() => setResetStep((s) => Math.max(1, s - 1))}
                    title="Back"
                  >
                    <i className="fa fa-arrow-left" />
                  </button>
                )}
                <h3>Reset Password</h3>
              </div>
              <button className="modal-close" onClick={closeResetPasswordModal}>×</button>
            </div>

            <div className="form-body">
              <div className="txt-muted txt-sm" style={{ marginBottom: 16 }}>
                Step {resetStep} of 3
              </div>

              {resetStep === 1 && (
                <>
                  <div className="form-group">
                    <label className="form-label">Email ID <span className="required">*</span></label>
                    <input
                      type="email"
                      className={`form-control${resetErrors.email ? ' is-err' : ''}`}
                      value={resetForm.email}
                      onChange={(e) => setResetField('email', e.target.value)}
                      placeholder="Enter registered email"
                    />
                    {resetErrors.email && <div className="form-error show">{resetErrors.email}</div>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Phone Number <span className="required">*</span></label>
                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      className={`form-control${resetErrors.phone ? ' is-err' : ''}`}
                      value={resetForm.phone}
                      onChange={(e) => setResetField('phone', sanitizePhone(e.target.value))}
                      onPaste={(e) => {
                        e.preventDefault();
                        setResetField('phone', sanitizePhone(e.clipboardData.getData('text')));
                      }}
                      placeholder="Enter 10 digit number"
                    />
                    {resetErrors.phone && <div className="form-error show">{resetErrors.phone}</div>}
                  </div>
                </>
              )}

              {resetStep === 2 && (
                <div className="form-group">
                  <label className="form-label">OTP <span className="required">*</span></label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={6}
                    className={`form-control${resetErrors.otp ? ' is-err' : ''}`}
                    value={resetForm.otp}
                    onChange={(e) => setResetField('otp', e.target.value.replace(/\D/g, '').slice(0, 6))}
                    onPaste={(e) => {
                      e.preventDefault();
                      setResetField('otp', e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6));
                    }}
                    placeholder="Enter 6 digit OTP"
                  />
                  {resetErrors.otp && <div className="form-error show">{resetErrors.otp}</div>}
                </div>
              )}

              {resetStep === 3 && (
                <>
                  <div className="form-group">
                    <label className="form-label">New Password <span className="required">*</span></label>
                    <input
                      type="password"
                      className={`form-control${resetErrors.newPassword ? ' is-err' : ''}`}
                      value={resetForm.newPassword}
                      onChange={(e) => setResetField('newPassword', e.target.value)}
                      placeholder="Enter new password"
                    />
                    {resetErrors.newPassword && <div className="form-error show">{resetErrors.newPassword}</div>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Confirm Password <span className="required">*</span></label>
                    <input
                      type="password"
                      className={`form-control${resetErrors.confirmPassword ? ' is-err' : ''}`}
                      value={resetForm.confirmPassword}
                      onChange={(e) => setResetField('confirmPassword', e.target.value)}
                      placeholder="Confirm new password"
                    />
                    {resetErrors.confirmPassword && <div className="form-error show">{resetErrors.confirmPassword}</div>}
                  </div>
                </>
              )}
            </div>

            <div className="form-actions">
              <button className="btn-secondary" onClick={closeResetPasswordModal}>Cancel</button>
              {resetStep === 1 && (
                <button className="btn-primary" onClick={handleSendOtp}>
                  <i className="fa fa-paper-plane" /> Send OTP
                </button>
              )}
              {resetStep === 2 && (
                <button className="btn-primary" onClick={handleVerifyOtp}>
                  <i className="fa fa-check" /> Verify OTP
                </button>
              )}
              {resetStep === 3 && (
                <button className="btn-primary" onClick={handlePasswordReset}>
                  <i className="fa fa-lock" /> Reset Password
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function toRoleLabel(value) {
  if (!value) return 'User';
  return value.charAt(0).toUpperCase() + value.slice(1);
}
