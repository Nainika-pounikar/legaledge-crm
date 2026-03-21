import { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useCRM } from '../context/CRMContext';
import { clearStoredAuth, getSignupUsers, saveSignupUsers } from '../utils/auth';

const MOCK_USERS = [
  {
    id: 1,
    email: 'shailesh@legaledge.in',
    password: 'Admin@123',
    role: 'admin',
    name: 'Shailesh Bhange',
    teamId: null,
    avatar: 'SB',
  },
  {
    id: 2,
    email: 'arjun@legaledge.in',
    password: 'Manager@123',
    role: 'manager',
    name: 'Arjun Mehta',
    teamId: 'team_01',
    avatar: 'AM',
  },
  {
    id: 3,
    email: 'priya@legaledge.in',
    password: 'User@123',
    role: 'user',
    name: 'Priya Sharma',
    teamId: 'team_01',
    avatar: 'PS',
  },
];

function generateMockToken(user) {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(
    JSON.stringify({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      teamId: user.teamId,
      avatar: user.avatar,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 8,
    }),
  );
  const signature = btoa('mock-signature');
  return `${header}.${payload}.${signature}`;
}

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const ROLE_REDIRECT = {
  admin: '/dashboards',
  manager: '/dashboards',
  user: '/dashboards',
};

const AUTH_USERS_KEY = 'users';

const mergeUsersByEmail = (...sources) => {
  const userMap = new Map();
  sources.flat().forEach((user) => {
    if (!user?.email) return;
    userMap.set(user.email.trim().toLowerCase(), user);
  });
  return Array.from(userMap.values());
};

const getStoredUsers = () => {
  try {
    const raw = localStorage.getItem(AUTH_USERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export default function Login() {
  const { setCurrentUser, showToast } = useCRM();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [allUsers, setAllUsers] = useState(() =>
    mergeUsersByEmail(MOCK_USERS, getSignupUsers(), getStoredUsers()),
  );
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotForm, setForgotForm] = useState({
    email: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [forgotErrors, setForgotErrors] = useState({});

  useEffect(() => {
    const prefill = location.state;
    if (prefill?.email && prefill?.password) {
      setForm({
        email: prefill.email,
        password: prefill.password,
      });
    }
  }, [location.state]);

  useEffect(() => {
    localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(allUsers));
  }, [allUsers]);

  const handleChange = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: '' }));
    if (apiError) setApiError('');
  };

  const validate = () => {
    const errs = {};
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!isValidEmail(form.email)) errs.email = 'Enter a valid email address';
    if (!form.password.trim()) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    setApiError('');

    try {
      await new Promise((r) => setTimeout(r, 800));

      const normalizedEmail = form.email.trim().toLowerCase();
      const matched = allUsers.find(
        (u) => (u.email || '').toLowerCase() === normalizedEmail && u.password === form.password,
      );

      if (!matched) {
        setApiError('Invalid email or password. Please try again.');
        setLoading(false);
        return;
      }

      const token = generateMockToken(matched);
      const user = {
        id: matched.id,
        name: matched.name,
        email: matched.email,
        role: matched.role,
        teamId: matched.teamId,
        avatar: matched.avatar,
      };

      clearStoredAuth();
      const storage = remember ? localStorage : sessionStorage;
      storage.setItem('crm_token', token);
      storage.setItem('crm_user', JSON.stringify(user));

      setCurrentUser(user);
      showToast(`Welcome back, ${user.name.split(' ')[0]}!`);
      navigate(ROLE_REDIRECT[user.role], { replace: true });
    } catch (err) {
      setApiError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleLogin();
  };

  const closeForgotModal = () => {
    setShowForgotModal(false);
    setForgotErrors({});
    setForgotForm({ email: '', newPassword: '', confirmPassword: '' });
  };

  const handleResetPassword = () => {
    const nextErrors = {};
    const normalizedEmail = forgotForm.email.trim().toLowerCase();

    if (!normalizedEmail) nextErrors.email = 'Email is required';
    else if (!isValidEmail(normalizedEmail)) nextErrors.email = 'Enter a valid email address';
    if (!forgotForm.newPassword.trim()) nextErrors.newPassword = 'New password is required';
    else if (forgotForm.newPassword.length < 6) nextErrors.newPassword = 'Password must be at least 6 characters';
    if (!forgotForm.confirmPassword.trim()) nextErrors.confirmPassword = 'Confirm password is required';
    else if (forgotForm.newPassword !== forgotForm.confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match';
    }

    setForgotErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    const userIndex = allUsers.findIndex(
      (u) => (u?.email || '').trim().toLowerCase() === normalizedEmail,
    );
    if (userIndex === -1) {
      setForgotErrors({ email: 'Email not found' });
      showToast('Email not found', 'error');
      return;
    }

    const updatedUsers = [...allUsers];
    updatedUsers[userIndex] = {
      ...updatedUsers[userIndex],
      password: forgotForm.newPassword,
    };
    setAllUsers(updatedUsers);

    const updatedSignupUsers = getSignupUsers().map((u) =>
      (u?.email || '').trim().toLowerCase() === normalizedEmail
        ? { ...u, password: forgotForm.newPassword }
        : u,
    );
    saveSignupUsers(updatedSignupUsers);

    setForm({ email: normalizedEmail, password: forgotForm.newPassword });
    showToast('Password reset successful');
    closeForgotModal();
  };

  return (
    <div style={styles.page}>
      <div className="card" style={styles.card}>
        <div style={styles.logoWrap}>
          <img
            src="/logo_legaledge.png"
            alt="LegalEdge"
            style={styles.logo}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>

        <div style={{ marginBottom: 28 }}>
          <h2 className="page-title" style={{ margin: 0, fontSize: 22 }}>
            Welcome back
          </h2>
          <p className="page-subtitle" style={{ margin: '4px 0 0' }}>
            Sign in to your CRM account
          </p>
        </div>

        {apiError && (
          <div style={styles.alertError}>
            <i className="fa-solid fa-circle-exclamation" style={{ marginRight: 8 }} />
            {apiError}
          </div>
        )}

        <div className="form-group" style={{ marginBottom: 16 }}>
          <label className="form-label">Email Address</label>
          <input
            type="email"
            className={`form-control${errors.email ? ' is-err' : ''}`}
            value={form.email}
            onChange={(e) => handleChange('email', e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="you@legaledge.in"
            autoComplete="email"
            disabled={loading}
          />
          {errors.email && <span className="form-error show">{errors.email}</span>}
        </div>

        <div className="form-group" style={{ marginBottom: 8 }}>
          <label className="form-label">Password</label>
          <div style={styles.passWrap}>
            <input
              type={showPass ? 'text' : 'password'}
              className={`form-control${errors.password ? ' is-err' : ''}`}
              value={form.password}
              onChange={(e) => handleChange('password', e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="........"
              autoComplete="current-password"
              disabled={loading}
              style={{ paddingRight: 40 }}
            />
            <button
              type="button"
              onClick={() => setShowPass((s) => !s)}
              style={styles.eyeBtn}
              tabIndex={-1}
              title={showPass ? 'Hide password' : 'Show password'}
            >
              <i className={`fa-solid ${showPass ? 'fa-eye-slash' : 'fa-eye'}`} />
            </button>
          </div>
          {errors.password && <span className="form-error show">{errors.password}</span>}
        </div>

        <div style={styles.row}>
          <label style={styles.rememberLabel}>
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              style={{ marginRight: 6, accentColor: '#0f2440' }}
            />
            Remember me
          </label>
          <span
            style={styles.forgotLink}
            role="button"
            tabIndex={0}
            onClick={() => setShowForgotModal(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') setShowForgotModal(true);
            }}
          >
            Forgot password?
          </span>
        </div>

        <button
          className="btn-primary"
          onClick={handleLogin}
          disabled={loading}
          style={{ width: '100%', marginTop: 24, padding: '12px', fontSize: 15 }}
        >
          {loading ? (
            <>
              <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: 8 }} />
              Signing in...
            </>
          ) : (
            <>
              <i className="fa-solid fa-right-to-bracket" style={{ marginRight: 8 }} />
              Sign In
            </>
          )}
        </button>

        <p className="txt-sm txt-muted" style={{ marginTop: 14, textAlign: 'center' }}>
          {`Don't have an account? `}<Link to="/signup">Sign Up</Link>
        </p>

        <div style={styles.demoBox}>
          <p style={{ margin: '0 0 6px', fontWeight: 600, fontSize: 12, color: '#374151' }}>
            Demo Credentials
          </p>
          {MOCK_USERS.map((u) => (
            <div
              key={u.id}
              style={styles.demoRow}
              onClick={() => {
                setForm({ email: u.email, password: u.password });
                setErrors({});
                setApiError('');
              }}
            >
              <span
                style={{
                  ...styles.rolePill,
                  background:
                    u.role === 'admin'
                      ? '#fee2e2'
                      : u.role === 'manager'
                        ? '#fef9c3'
                        : '#dcfce7',
                  color:
                    u.role === 'admin'
                      ? '#b91c1c'
                      : u.role === 'manager'
                        ? '#854d0e'
                        : '#15803d',
                }}
              >
                {u.role}
              </span>
              <span style={styles.demoEmail}>{u.email}</span>
              <span style={styles.demoPassword}>
                {u.password}
              </span>
            </div>
          ))}
          <p style={{ margin: '8px 0 0', fontSize: 11, color: '#9ca3af' }}>
            Click any row to autofill credentials
          </p>
        </div>
      </div>

      {showForgotModal && (
        <div
          className="modal-overlay show"
          onClick={(e) => {
            if (e.target.classList.contains('modal-overlay')) closeForgotModal();
          }}
        >
          <div className="modal" style={{ maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Reset Password</h3>
              <button className="modal-close" onClick={closeForgotModal}>
                <i className="fa fa-times" />
              </button>
            </div>

            <div className="form-body">
              <div className="form-group">
                <label className="form-label">Email ID</label>
                <input
                  type="email"
                  className={`form-control${forgotErrors.email ? ' is-err' : ''}`}
                  value={forgotForm.email}
                  onChange={(e) => {
                    setForgotForm((prev) => ({ ...prev, email: e.target.value }));
                    if (forgotErrors.email) {
                      setForgotErrors((prev) => ({ ...prev, email: '' }));
                    }
                  }}
                />
                {forgotErrors.email && <span className="form-error show">{forgotErrors.email}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  className={`form-control${forgotErrors.newPassword ? ' is-err' : ''}`}
                  value={forgotForm.newPassword}
                  onChange={(e) => {
                    setForgotForm((prev) => ({ ...prev, newPassword: e.target.value }));
                    if (forgotErrors.newPassword) {
                      setForgotErrors((prev) => ({ ...prev, newPassword: '' }));
                    }
                  }}
                />
                {forgotErrors.newPassword && (
                  <span className="form-error show">{forgotErrors.newPassword}</span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input
                  type="password"
                  className={`form-control${forgotErrors.confirmPassword ? ' is-err' : ''}`}
                  value={forgotForm.confirmPassword}
                  onChange={(e) => {
                    setForgotForm((prev) => ({ ...prev, confirmPassword: e.target.value }));
                    if (forgotErrors.confirmPassword) {
                      setForgotErrors((prev) => ({ ...prev, confirmPassword: '' }));
                    }
                  }}
                />
                {forgotErrors.confirmPassword && (
                  <span className="form-error show">{forgotErrors.confirmPassword}</span>
                )}
              </div>
            </div>

            <div className="form-actions">
              <button className="btn-secondary" onClick={closeForgotModal}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleResetPassword}>
                Reset Password
              </button>
            </div>
          </div>
        </div>
      )}

      <p style={styles.footer}>
        {`© ${new Date().getFullYear()} LegalEdge India. All rights reserved.`}
      </p>
    </div>
  );
}

export { decodeToken, isTokenExpired } from '../utils/auth';

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #f0f4ff 0%, #f8f9fc 60%, #e8f0fe 100%)',
    padding: '24px 16px',
  },
  card: {
    width: '100%',
    maxWidth: 440,
    padding: 36,
    boxSizing: 'border-box',
    borderRadius: 12,
    boxShadow: '0 8px 32px rgba(15, 36, 64, 0.12)',
  },
  logoWrap: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  logo: {
    height: 36,
    objectFit: 'contain',
  },
  brandName: {
    margin: 0,
    fontSize: 20,
    fontWeight: 800,
    color: '#0f2440',
    fontFamily: 'Sora, sans-serif',
    letterSpacing: '-0.3px',
  },
  alertError: {
    background: '#fee2e2',
    color: '#b91c1c',
    border: '1px solid #fecaca',
    borderRadius: 8,
    padding: '10px 14px',
    fontSize: 13,
    marginBottom: 16,
    display: 'flex',
    alignItems: 'center',
  },
  passWrap: {
    position: 'relative',
  },
  eyeBtn: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#6b7280',
    padding: 0,
    fontSize: 14,
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    rowGap: 8,
    marginTop: 12,
  },
  rememberLabel: {
    display: 'flex',
    alignItems: 'center',
    fontSize: 13,
    color: '#374151',
    cursor: 'pointer',
    userSelect: 'none',
  },
  forgotLink: {
    fontSize: 13,
    color: '#2563eb',
    textDecoration: 'none',
    fontWeight: 600,
  },
  demoBox: {
    marginTop: 24,
    padding: '14px 16px',
    background: '#f8f9fc',
    border: '1px dashed #d1d5db',
    borderRadius: 8,
  },
  demoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '6px 8px',
    minWidth: 0,
    borderRadius: 6,
    cursor: 'pointer',
    transition: 'background 0.15s',
    marginBottom: 4,
  },
  rolePill: {
    fontSize: 11,
    fontWeight: 700,
    padding: '2px 8px',
    borderRadius: 20,
    textTransform: 'capitalize',
    flexShrink: 0,
  },
  demoEmail: {
    color: '#374151',
    fontSize: 12,
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  demoPassword: {
    color: '#9ca3af',
    fontSize: 12,
    marginLeft: 6,
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  footer: {
    marginTop: 24,
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
};
