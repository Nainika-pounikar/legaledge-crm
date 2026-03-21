import { useNavigate } from 'react-router-dom';

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px 16px',
    background: 'linear-gradient(135deg, #f0f4ff 0%, #f8f9fc 60%, #e8f0fe 100%)',
  },
  card: {
    width: '100%',
    maxWidth: 460,
    padding: 36,
    textAlign: 'center',
  },
  logo: {
    height: 46,
    objectFit: 'contain',
    marginBottom: 16,
  },
  title: {
    margin: '0 0 24px',
    fontSize: 28,
    lineHeight: 1.2,
  },
  actions: {
    display: 'flex',
    gap: 12,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
};

export default function AuthEntry() {
  const navigate = useNavigate();

  return (
    <div className="auth-container center" style={styles.page}>
      <div className="card" style={styles.card}>
        <img
          src="/logo_legaledge.png"
          alt="LegalEdge CRM"
          className="auth-logo"
          style={styles.logo}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />

        <h1 className="auth-title page-title" style={styles.title}>
          Welcome To LegalEdge CRM
        </h1>

        <div className="auth-actions" style={styles.actions}>
          <button className="btn-primary" onClick={() => navigate('/login')}>
            Login
          </button>
          <button className="btn-secondary" onClick={() => navigate('/signup')}>
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}
