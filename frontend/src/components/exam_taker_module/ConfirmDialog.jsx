import React from 'react';

/**
 * Custom dialog component for confirming exam submission
 * @param {Object} props Component props
 * @param {string} props.message Dialog message content
 * @param {Function} props.onConfirm Function to call when confirming
 * @param {Function} props.onCancel Function to call when canceling
 */
const ConfirmDialog = ({ message, onConfirm, onCancel }) => {
  return (
    <div className="confirm-dialog-overlay">
      <div className="confirm-dialog">
        <div className="confirm-dialog-message">{message}</div>
        <div className="confirm-dialog-buttons">
          <button className="confirm-btn" onClick={onConfirm}>Submit Anyway</button>
          <button className="cancel-btn" onClick={onCancel}>Back to Exam</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;