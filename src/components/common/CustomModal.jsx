// components/CustomModal.jsx
import React, { useState } from 'react';

const CustomModal = ({ config, setConfig }) => {
  const [inputValue, setInputValue] = useState(config.defaultValue || '');

  const handleConfirm = () => {
    if (config.type === 'prompt' && config.onConfirm) {
      config.onConfirm(inputValue);
    } else if (config.onConfirm) {
      config.onConfirm();
    }
    setConfig(prev => ({ ...prev, show: false }));
  };

  const handleCancel = () => {
    if (config.onCancel) {
      config.onCancel();
    }
    setConfig(prev => ({ ...prev, show: false }));
  };

  if (!config.show) return null;

  return (
    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{config.title}</h5>
            <button type="button" className="btn-close" onClick={handleCancel}></button>
          </div>
          <div className="modal-body">
            <div style={{ whiteSpace: 'pre-line' }}>{config.message}</div>
            {config.showInput && (
              <input
                type="text"
                className="form-control mt-3"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                autoFocus
              />
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={handleCancel}>
              {config.type === 'confirm' ? 'No' : 'Cancel'}
            </button>
            <button type="button" className="btn btn-primary" onClick={handleConfirm}>
              {config.type === 'confirm' ? 'Yes' : 'OK'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomModal;