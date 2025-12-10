// components/ProfitCalculator.jsx
import React from 'react';

const ProfitCalculator = ({
  selectedItem,
  saleData,
  profit,
  loading,
  validateStock,
  setStep,
  setMessage
}) => {
  return (
    <div className="card bg-light sticky-top" style={{top: '20px'}}>
      <div className="card-header">
        <h6 className="mb-0">
          <i className="bi bi-calculator me-2"></i>
          Profit Calculation
        </h6>
      </div>
      <div className="card-body">
        <div className="mb-3">
          <h6>Price Details</h6>
          <div className="d-flex justify-content-between mb-2">
            <span>Sale Price:</span>
            <span className="fw-bold">{saleData.salePrice || '0.00'} PKR/sq.ft</span>
          </div>
          <div className="d-flex justify-content-between mb-2">
            <span>Cost Price:</span>
            <span>{parseFloat(selectedItem.purchasePrice).toFixed(2)} PKR/sq.ft</span>
          </div>
          <hr />
          <div className="d-flex justify-content-between">
            <strong>Profit per sq.ft:</strong>
            <strong className={profit.perSqft >= 0 ? 'text-success' : 'text-danger'}>
              {profit.perSqft.toFixed(2)} PKR
            </strong>
          </div>
        </div>
        
        <div className="mb-3">
          <h6>Quantity & Total</h6>
          <div className="d-flex justify-content-between mb-2">
            <span>Quantity:</span>
            <span>{saleData.quantity || '0.00'} sq.ft</span>
          </div>
          <div className="d-flex justify-content-between mb-2">
            <span>Total Amount:</span>
            <span className="fw-bold">
              {(saleData.quantity && saleData.salePrice) 
                ? (parseFloat(saleData.quantity) * parseFloat(saleData.salePrice)).toFixed(2) 
                : '0.00'} PKR
            </span>
          </div>
          <hr />
          <div className="d-flex justify-content-between">
            <strong>Total Profit:</strong>
            <strong className={profit.total >= 0 ? 'text-success' : 'text-danger'}>
              {profit.total.toFixed(2)} PKR
            </strong>
          </div>
        </div>
        
        {/* Stock Validation */}
        {saleData.quantity && (
          <div className={`alert ${parseFloat(saleData.quantity) > selectedItem.quantity ? 'alert-danger' : 'alert-success'} mb-3`}>
            <i className={`bi ${parseFloat(saleData.quantity) > selectedItem.quantity ? 'bi-exclamation-triangle' : 'bi-check-circle'} me-2`}></i>
            <strong>Stock Status:</strong><br />
            Available: {parseFloat(selectedItem.quantity).toFixed(2)} sq.ft<br />
            Requested: {parseFloat(saleData.quantity).toFixed(2)} sq.ft<br />
            {parseFloat(saleData.quantity) > selectedItem.quantity ? (
              <strong className="text-danger">❌ INSUFFICIENT STOCK</strong>
            ) : (
              <strong className="text-success">✅ STOCK AVAILABLE</strong>
            )}
          </div>
        )}
        
        {/* Navigation Buttons */}
        <div className="d-grid gap-2">
          <button 
            className="btn btn-primary"
            onClick={() => {
              if (!saleData.customerName) {
                setMessage({ type: 'error', text: 'Please select or add a customer first' });
                return;
              }
              if (!saleData.quantity || !saleData.salePrice) {
                setMessage({ type: 'error', text: 'Please enter quantity and sale price' });
                return;
              }
              if (validateStock()) {
                setStep(3);
              }
            }}
            disabled={!saleData.customerName || !saleData.quantity || !saleData.salePrice || loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Processing...
              </>
            ) : (
              <>
                <i className="bi bi-arrow-right-circle me-2"></i>
                Continue to Invoice
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfitCalculator;