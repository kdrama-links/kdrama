import React, { useState } from 'react';

// Simple inline chat bubble SVG icon
const ChatIcon: React.FC = () => (
  <svg width="32" height="32" fill="none" aria-hidden="true" viewBox="0 0 48 48">
    <circle fill="#fff" cx="24" cy="24" r="24" />
    <path fill="#F06292" d="M36 32.5V17.6A3.6 3.6 0 0 0 32.4 14H15.6A3.6 3.6 0 0 0 12 17.6v14.9A1.5 1.5 0 0 0 13.5 34H32l3.5 3.5a1 1 0 0 0 1.5-.9V34a1.5 1.5 0 0 0-.5-1zm-11-7.75a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5zm5 0a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5zm-10 0a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5z"/>
  </svg>
);

const ContactWidget: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Chat Icon Button */}
      <button
        aria-label="Open contact form"
        onClick={() => setOpen(!open)}
        style={{
          position: 'fixed',
          left: 24,
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

      {/* Floating Contact Form */}
      {open && (
        <div
          style={{
            position: 'fixed',
            left: 24,
            bottom: 72,
            zIndex: 10000,
            background: '#fff',
            borderRadius: 16,
            boxShadow: '0 6px 32px 0 rgba(0,0,0,0.18)',
            width: 330,
            maxWidth: '95vw',
            padding: 20,
            transition: 'all 0.2s',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ fontWeight: 600, color: '#F06292' }}>Contact Us</div>
            <button
              onClick={() => setOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: 20,
                cursor: 'pointer',
                color: '#555',
                padding: 0,
                lineHeight: 1,
              }}
              aria-label="Close contact form"
            >
              ×
            </button>
          </div>
          <form
            method="POST"
            action="/"
            style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
          >
            <label style={{ fontWeight: 500, fontSize: 15 }}>Name:</label>
            <input
              name="name"
              type="text"
              required
              style={{
                borderRadius: 6,
                border: '1px solid #ccc',
                padding: 8,
                fontSize: 14,
              }}
            />
            <label style={{ fontWeight: 500, fontSize: 15 }}>Email:</label>
            <input
              name="email"
              type="email"
              required
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
              rows={4}
              style={{
                borderRadius: 6,
                border: '1px solid #ccc',
                padding: 8,
                fontSize: 14,
                resize: 'vertical',
              }}
            />
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
              Send Message
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default ContactWidget;
