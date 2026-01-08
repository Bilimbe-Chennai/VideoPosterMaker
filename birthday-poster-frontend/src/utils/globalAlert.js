import React from 'react';
import ReactDOM from 'react-dom/client';

// Simple global alert utility for non-component contexts
export const showGlobalAlert = (message, type = 'info', onConfirm = null) => {
  // Remove any existing alert
  const existingAlert = document.getElementById('global-alert-container');
  if (existingAlert) {
    existingAlert.remove();
  }

  // Create container
  const container = document.createElement('div');
  container.id = 'global-alert-container';
  document.body.appendChild(container);

  const root = ReactDOM.createRoot(container);

  const AlertModal = () => {
    const [show, setShow] = React.useState(true);

    const handleClose = () => {
      setShow(false);
      setTimeout(() => {
        root.unmount();
        container.remove();
      }, 200);
    };

    const handleConfirm = () => {
      if (onConfirm) {
        onConfirm();
      }
      handleClose();
    };

    if (!show) return null;

    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 3000,
          backdropFilter: 'blur(5px)',
          animation: 'fadeIn 0.2s ease'
        }}
        onClick={onConfirm ? undefined : handleClose}
      >
        <div
          style={{
            background: 'white',
            width: '100%',
            maxWidth: '450px',
            padding: '32px',
            borderRadius: '32px',
            position: 'relative',
            textAlign: 'center',
            animation: 'slideUp 0.2s ease'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: type === 'error' ? '#EF444420' : '#F59E0B20',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              color: type === 'error' ? '#EF4444' : '#F59E0B'
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <div
            style={{
              fontSize: '16px',
              color: '#1A1A1A',
              marginBottom: '32px',
              lineHeight: '1.6'
            }}
          >
            {message}
          </div>
          <div
            style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center',
              marginTop: '24px'
            }}
          >
            {onConfirm ? (
              <>
                <button
                  onClick={handleClose}
                  style={{
                    padding: '12px 24px',
                    borderRadius: '14px',
                    fontWeight: '700',
                    fontSize: '14px',
                    cursor: 'pointer',
                    border: 'none',
                    background: '#F3F4F6',
                    color: '#374151',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => e.target.style.background = '#E5E7EB'}
                  onMouseOut={(e) => e.target.style.background = '#F3F4F6'}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  style={{
                    padding: '12px 24px',
                    borderRadius: '14px',
                    fontWeight: '700',
                    fontSize: '14px',
                    cursor: 'pointer',
                    border: 'none',
                    background: '#1A1A1A',
                    color: 'white',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => e.target.style.background = '#000'}
                  onMouseOut={(e) => e.target.style.background = '#1A1A1A'}
                >
                  OK
                </button>
              </>
            ) : (
              <button
                onClick={handleClose}
                style={{
                  padding: '12px 24px',
                  borderRadius: '14px',
                  fontWeight: '700',
                  fontSize: '14px',
                  cursor: 'pointer',
                  border: 'none',
                  background: '#1A1A1A',
                  color: 'white',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.target.style.background = '#000'}
                onMouseOut={(e) => e.target.style.background = '#1A1A1A'}
              >
                OK
              </button>
            )}
          </div>
        </div>
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    );
  };

  root.render(<AlertModal />);
};
