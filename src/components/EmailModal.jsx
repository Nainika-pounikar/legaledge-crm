import { useState } from 'react';
import { useCRM } from '../context/CRMContext';

const TEMPLATES = {
  followup: {
    subject: 'Following up on our conversation',
    body: `Hi,\n\nI wanted to follow up on our recent conversation about LegalEdge CRM.\n\nWould you be available for a quick call this week to discuss next steps?\n\nBest regards,\nShailesh Bhange\nLegalEdge CRM`,
  },
  proposal: {
    subject: 'LegalEdge CRM – Proposal',
    body: `Dear,\n\nThank you for your interest in LegalEdge CRM.\n\nPlease find our tailored proposal below. Key highlights:\n• Full CRM platform with Breeze AI\n• Dedicated onboarding support\n• 24/7 technical assistance\n\nLet me know if you'd like to schedule a demo.\n\nBest regards,\nShailesh Bhange`,
  },
  welcome: {
    subject: 'Welcome to LegalEdge CRM!',
    body: `Hi,\n\nWelcome to LegalEdge CRM! We're thrilled to have you on board.\n\nYour account is now active. Our onboarding team will be in touch shortly to get you set up.\n\nBest regards,\nThe LegalEdge Team`,
  },
};

const PROVIDERS = [
  { key:'gmail',   label:'Gmail',   color:'#ea4335', icon:'fa-envelope' },
  { key:'outlook', label:'Outlook', color:'#0078d4', icon:'fa-envelope' },
  { key:'emailjs', label:'EmailJS', color:'var(--primary)', icon:'fa-paper-plane' },
];

export default function EmailModal({ open, onClose, defaultTo='', defaultSubject='' }) {
  const { showToast } = useCRM();
  const [provider, setProvider] = useState('gmail');
  const [to,       setTo]       = useState(defaultTo);
  const [subject,  setSubject]  = useState(defaultSubject);
  const [body,     setBody]     = useState('');
  const [errors,   setErrors]   = useState({});

  if (!open) return null;

  function validate() {
    const e = {};
    if (!to)      e.to      = 'Email is required';
    if (!subject) e.subject = 'Subject is required';
    if (!body)    e.body    = 'Message is required';
    setErrors(e);
    return !Object.keys(e).length;
  }

  function applyTemplate(key) {
    const t = TEMPLATES[key];
    setSubject(t.subject);
    setBody(t.body);
  }

  function sendEmail() {
    if (!validate()) return;
    if (provider === 'gmail') {
      window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
    } else if (provider === 'outlook') {
      window.open(`https://outlook.live.com/mail/0/deeplink/compose?to=${encodeURIComponent(to)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
    } else {
      showToast('Configure your EmailJS public key in EmailModal.jsx to send directly.', 'warning');
      return;
    }
    showToast(`Email opened in ${provider === 'gmail' ? 'Gmail' : 'Outlook'}!`);
    onClose();
  }

  return (
    <div className="modal-overlay show" onClick={e => { if (e.target.classList.contains('modal-overlay')) onClose(); }}>
      <div className="modal" style={{ maxWidth:560 }}>
        <div className="modal-header">
          <h3><i className="fa fa-envelope" style={{ color:'var(--primary)', marginRight:8 }}/>Compose Email</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="form-body">
          {/* Provider selector */}
          <div className="email-compose-header">
            <div className="email-provider-btns">
              {PROVIDERS.map(p => (
                <button key={p.key}
                  className={`email-provider-btn${provider===p.key?' active':''}`}
                  onClick={() => setProvider(p.key)}
                >
                  <i className={`fa ${p.icon}`} style={{ color:p.color }}/>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Fields */}
          <div className="form-group">
            <label className="form-label">To <span className="required">*</span></label>
            <input className={`form-control${errors.to?' is-err':''}`} value={to} onChange={e=>setTo(e.target.value)}/>
            {errors.to && <div className="field-error">{errors.to}</div>}
          </div>
          <div className="form-group">
            <label className="form-label">Subject <span className="required">*</span></label>
            <input className={`form-control${errors.subject?' is-err':''}`} value={subject} onChange={e=>setSubject(e.target.value)}/>
            {errors.subject && <div className="field-error">{errors.subject}</div>}
          </div>
          <div className="form-group">
            <label className="form-label">Message <span className="required">*</span></label>
            <textarea className={`form-control${errors.body?' is-err':''}`} rows={6} value={body} onChange={e=>setBody(e.target.value)}/>
            {errors.body && <div className="field-error">{errors.body}</div>}
          </div>

          {/* Quick Templates */}
          <div className="email-template-bar">
            <span style={{ fontSize:12, color:'var(--text-muted)' }}>Quick Templates:</span>
            {['followup','proposal','welcome'].map(k => (
              <button key={k} className="email-tmpl-btn" onClick={() => applyTemplate(k)}>
                {k.charAt(0).toUpperCase()+k.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div
          className="form-actions"
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 12,
            padding: '16px 20px',
            borderTop: '1px solid var(--border)',
            marginTop: 4,
          }}
        >
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={sendEmail}>
            <i className="fa fa-paper-plane" /> Send Email
          </button>
        </div>
      </div>
    </div>
  );
}
