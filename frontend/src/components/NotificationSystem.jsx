import { useState, useEffect } from 'react';

// Toast Notification Component
export function Toast({ message, type, onClose, duration = 4000 }) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const getToastClasses = () => {
    const baseClasses = "toast show position-fixed";
    const typeClasses = {
      success: "bg-success text-white",
      error: "bg-danger text-white",
      warning: "bg-warning text-dark",
      info: "bg-primary text-white"
    };
    return `${baseClasses} ${typeClasses[type] || typeClasses.info}`;
  };

  const getIcon = () => {
    const icons = {
      success: "✓",
      error: "✗",
      warning: "⚠",
      info: "ℹ"
    };
    return icons[type] || icons.info;
  };

  return (
    <div 
      className={getToastClasses()}
      style={{
        top: '20px',
        right: '20px',
        zIndex: 9999,
        minWidth: '300px',
        maxWidth: '500px'
      }}
    >
      <div className="toast-header border-0 bg-transparent text-white">
        <span className="me-2" style={{fontSize: '1.2rem'}}>{getIcon()}</span>
        <strong className="me-auto">
          {type === 'success' ? 'Success' : 
           type === 'error' ? 'Error' : 
           type === 'warning' ? 'Warning' : 'Info'}
        </strong>
        <button 
          type="button" 
          className="btn-close btn-close-white" 
          onClick={onClose}
        ></button>
      </div>
      <div className="toast-body">
        {message}
      </div>
    </div>
  );
}

// Confirmation Modal Component
export function ConfirmModal({ 
  show, 
  title, 
  message, 
  confirmText = "Confirm", 
  cancelText = "Cancel",
  confirmVariant = "danger",
  onConfirm, 
  onCancel 
}) {
  if (!show) return null;

  return (
    <div className="modal fade show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header border-0 pb-0">
            <h5 className="modal-title fw-bold">{title}</h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={onCancel}
            ></button>
          </div>
          <div className="modal-body py-4">
            <p className="mb-0 text-muted">{message}</p>
          </div>
          <div className="modal-footer border-0 pt-0">
            <button 
              type="button" 
              className="btn btn-outline-secondary" 
              onClick={onCancel}
            >
              {cancelText}
            </button>
            <button 
              type="button" 
              className={`btn btn-${confirmVariant}`}
              onClick={onConfirm}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Notification Hook for easy usage
export function useNotification() {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const showSuccess = (message) => addNotification(message, 'success');
  const showError = (message) => addNotification(message, 'error');
  const showWarning = (message) => addNotification(message, 'warning');
  const showInfo = (message) => addNotification(message, 'info');

  const NotificationContainer = () => (
    <div>
      {notifications.map(notification => (
        <Toast
          key={notification.id}
          message={notification.message}
          type={notification.type}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    NotificationContainer
  };
}

// Confirmation Hook for easy usage
export function useConfirmation() {
  const [confirmation, setConfirmation] = useState(null);

  const confirm = (options) => {
    return new Promise((resolve) => {
      setConfirmation({
        ...options,
        onConfirm: () => {
          setConfirmation(null);
          resolve(true);
        },
        onCancel: () => {
          setConfirmation(null);
          resolve(false);
        }
      });
    });
  };

  const ConfirmationModal = () => (
    confirmation ? <ConfirmModal {...confirmation} show={true} /> : null
  );

  return {
    confirm,
    ConfirmationModal
  };
}