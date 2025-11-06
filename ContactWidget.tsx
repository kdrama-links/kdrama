import React, { useState } from 'react';

// Inline SVG chat icon (matching your theme)
const ChatIcon: React.FC = () => (
  <svg width="32" height="32" fill="none" aria-hidden="true" viewBox="0 0 48 48">
    <circle fill="#fff" cx="24" cy="24" r="24" />
    <path fill="#F06292" d="M36 32.5V17.6A3.6 3.6 0 0 0 32.4 14H15.6A3.6 3.6 0 0 0 12 17.6v14.9A1.5 1.5 0 0 0 13.5 34H32l3.5 3.5a1 1 0 0 0 1.5-.9V34a1.5 1.5 0 0 0-.5-1zm-11-7.75a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5zm5 0a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5zm-10 0a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5z"/>
  </svg>
);

const ContactWidget: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [fields, setFields] = useState({ name: '', email: '', message: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFields({ ...fields, [e.target.name]: e.target.value });
  };

  const allFilled = fields.name.trim() && fields.email.trim() && fields.message.trim();

  return (
    <>
      {/* The fixed chat float icon */}
      <button
        aria-label="Open contact form"
        onClick={() => setOpen((v) => !v)}
        style={{
          position: 'fixed',
          right: 24,
          bottom: 24,
          zIndex: 9999,
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          background: 'transparent',
        }}
      >
        <ChatIcon />
      </button>
      {/* The floating small contact window */}
      {open && (
        <div
          style={{
            position: 'fixed',
            right: 24,
            bottom: 74, // 24 + 50px space for floating above button
            zIndex: 10000,
            background: '#fff',
            borderRadius: 16,
            boxShadow: '0 6px 32px 0 rgba(0,0,0,0.18)',
            width: 340,
            maxWidth: '95vw',
            padding: 20,
            transition: 'all 0.2s',
            fontFamily: 'Arial,sans-serif',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontWeight: 700, color: '#F06292', fontSize: 18 }}>Feedback</span>
            <button
              onClick={() => setOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: 22,
                cursor: 'pointer',
                color: '#999',
                padding: 0,
                lineHeight: 1,
              }}
              aria-label="Close contact form"
            >
              ×
            </button>
          </div>
          {!submitted ? (
            <form
              action="/"
              method="POST"
              autoComplete="off"
              style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
              onSubmit={e => {
                setSubmitted(true);
              }}
            >
              <label style={{ fontWeight: 500, fontSize: 15 }}>Name:</label>
              <input
                name="name"
                type="text"
                required
                value={fields.name}
                onChange={handleChange}
                style={{
                  borderRadius: 6,
                  border: '1px solid #ccc',
                  padding: 8,
                  fontSize: 14,
                }}
              />
              <label style={{ fontWeight: 500, fontSize: 15 }}>Email or Telegram username</label>
              <input
                name="email"
                type="email"
                required
                value={fields.email}
                onChange={handleChange}
                style={{
                  borderRadius: 6,
                  border: '1px solid #ccc',
                  padding: 8,
                  fontSize: 14,
                }}
              />
              <label style={{ fontWeight: 500, fontSize: 15 }}>Message:</label>
              <textarea
                name="message"
                required
                value={fields.message}
                onChange={handleChange}
                rows={4}
                style={{
                  borderRadius: 6,
                  border: '1px solid #ccc',
                  padding: 8,
                  fontSize: 14,
                  resize: 'vertical',
                }}
              />
              {allFilled && (
                <button
                  type="submit"
                  style={{
                    marginTop: 10,
                    background: '#F06292',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    fontSize: 15,
                    padding: '10px 0',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  Send Feedback
                </button>
              )}
            </form>
          ) : (
            <div style={{ textAlign: 'center', padding: '32px 0 16px' }}>
              <h2 style={{ color: '#F06292', fontWeight: 700, marginBottom: 8 }}>
                Thank You!
              </h2>
              <p style={{ color: '#333', margin: 0, fontSize: 15 }}>Your message has been sent,<br />you will get a reply in 24–48 hours.</p>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ContactWidget;
