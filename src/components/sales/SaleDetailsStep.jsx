// components/SaleDetailsStep.jsx
import React from 'react';

const SaleDetailsStep = ({
  selectedItem,
  saleData,
  handleSaleDataChange,
  loading,
  setStep,
  onCompleteSale,
  setMessage
}) => {
  const calculateProfit = () => {
    if (!selectedItem || !saleData.quantity || !saleData.salePrice) {
      return { perSqft: 0, total: 0 };
    }
    
    const quantity = parseFloat(saleData.quantity) || 0;
    const salePrice = parseFloat(saleData.salePrice) || 0;
    const purchasePrice = parseFloat(selectedItem.purchasePrice) || 0;
    
    const profitPerSqft = salePrice - purchasePrice;
    const totalProfit = profitPerSqft * quantity;
    
    return {
      perSqft: profitPerSqft,
      total: totalProfit
    };
  };

  const profit = calculateProfit();

  const validateStock = () => {
    if (!selectedItem || !saleData.quantity) return true;
    
    const requestedQty = parseFloat(saleData.quantity) || 0;
    const availableQty = parseFloat(selectedItem.quantity) || 0;
    
    if (requestedQty > availableQty) {
      setMessage({ 
        type: 'error', 
        text: `❌ Stock not available!\nRequested: ${requestedQty} sq.ft\nAvailable: ${availableQty} sq.ft\n\nPlease reduce quantity or add new stock.` 
      });
      return false;
    }
    return true;
  };

  return (
    <div>
      <div className="row mb-4">
        <div className="col-md-8">
          {/* Selected Item and Customer Info */}
          <div className="card mb-3">
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <h6>
                    <i className="bi bi-box-seam me-2"></i>
                    Selected Item
                  </h6>
                  <table className="table table-sm">
                    <tbody>
                      <tr>
                        <td><strong>Marble:</strong></td>
                        <td>{selectedItem.name}</td>
                      </tr>
                      <tr>
                        <td><strong>Type:</strong></td>
                        <td><span className="badge bg-primary">{selectedItem.marbleType}</span></td>
                      </tr>
                      <tr>
                        <td><strong>Size:</strong></td>
                        <td>{selectedItem.width} × {selectedItem.height} {selectedItem.unit}</td>
                      </tr>
                      <tr>
                        <td><strong>Available:</strong></td>
                        <td className={`${selectedItem.quantity < 10 ? 'text-danger' : 'text-success'}`}>
                          {parseFloat(selectedItem.quantity).toFixed(2)} sq.ft
                        </td>
                      </tr>
                      <tr>
                        <td><strong>Cost Price:</strong></td>
                        <td>{parseFloat(selectedItem.purchasePrice).toFixed(2)} PKR/sq.ft</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="col-md-6">
                  <h6>
                    <i className="bi bi-person me-2"></i>
                    Customer Info
                  </h6>
                  <table className="table table-sm">
                    <tbody>
                      <tr>
                        <td><strong>Name:</strong></td>
                        <td>{saleData.customerName}</td>
                      </tr>
                      <tr>
                        <td><strong>Phone:</strong></td>
                        <td>{saleData.customerPhone || '-'}</td>
                      </tr>
                    </tbody>
                  </table>
                  <button 
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => setStep(1)}
                    disabled={loading}
                  >
                    <i className="bi bi-pencil me-1"></i>
                    Change Customer
                  </button>
                </div>
              </div>
              <div className="mt-3">
                <button 
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => setStep(2)}
                  disabled={loading}
                >
                  <i className="bi bi-arrow-left me-1"></i>
                  Change Item
                </button>
              </div>
            </div>
          </div>
          
          {/* Sale Details Form */}
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0">
                <i className="bi bi-cart me-2"></i>
                Sale Details
              </h6>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-bold">
                    <i className="bi bi-rulers me-1"></i>
                    Quantity (sq.ft) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    name="quantity"
                    value={saleData.quantity}
                    onChange={handleSaleDataChange}
                    placeholder="Enter quantity in sq.ft"
                    max={selectedItem.quantity}
                    required
                    disabled={loading}
                  />
                  <div className="form-text">
                    <i className="bi bi-info-circle me-1"></i>
                    Max available: <strong>{parseFloat(selectedItem.quantity).toFixed(2)} sq.ft</strong>
                    {saleData.quantity && parseFloat(saleData.quantity) > selectedItem.quantity && (
                      <span className="text-danger ms-2">
                        <i className="bi bi-exclamation-triangle me-1"></i>
                        Exceeds available stock!
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="col-md-6">
                  <label className="form-label fw-bold">
                    <i className="bi bi-currency-dollar me-1"></i>
                    Sale Price (per sq.ft) *
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">PKR</span>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      name="salePrice"
                      value={saleData.salePrice}
                      onChange={handleSaleDataChange}
                      placeholder="Enter sale price"
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="form-text">
                    <i className="bi bi-info-circle me-1"></i>
                    Cost price: <strong>{parseFloat(selectedItem.purchasePrice).toFixed(2)} PKR/sq.ft</strong>
                  </div>
                </div>
                
                <div className="col-md-6">
                  <label className="form-label">
                    <i className="bi bi-chat-text me-1"></i>
                    Remarks (Optional)
                  </label>
                  <textarea
                    className="form-control"
                    name="remarks"
                    value={saleData.remarks}
                    onChange={handleSaleDataChange}
                    rows="2"
                    placeholder="Any special notes, requirements, or instructions..."
                    disabled={loading}
                  />
                </div>
                
                <div className="col-md-6">
                  <label className="form-label">
                    <i className="bi bi-bag me-1"></i>
                    Cement/Bags Info (Optional)
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="cementInfo"
                    value={saleData.cementInfo}
                    onChange={handleSaleDataChange}
                    placeholder="e.g., 2 bags cement included, free delivery, etc."
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Profit Calculator */}
        <div className="col-md-4">
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
              
              {/* Complete Sale Button */}
              <div className="d-grid">
                <button 
                  className="btn btn-success btn-lg"
                  onClick={() => {
                    if (!saleData.quantity || !saleData.salePrice) {
                      setMessage({ type: 'error', text: 'Please enter quantity and sale price' });
                      return;
                    }
                    if (validateStock()) {
                      onCompleteSale();
                    }
                  }}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Processing Sale...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle me-2"></i>
                      Complete Sale
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaleDetailsStep;