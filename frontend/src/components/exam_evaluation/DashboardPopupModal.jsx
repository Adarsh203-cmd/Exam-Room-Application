// DashboardPopupModal.jsx
import React from 'react';

const DashboardPopupModal = ({ popupData, closeModal }) => {
  if (!popupData || !popupData.current) return null;

  return (
    <div className="modal-overlay" onClick={closeModal}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{popupData.current.title}</h2>
          {/* <button className="close-button" onClick={closeModal}>×</button> */}
        </div>
        <div className="modal-body">
          {popupData.current.content}
        </div>
      </div>
    </div>
  );
};

export default DashboardPopupModal;