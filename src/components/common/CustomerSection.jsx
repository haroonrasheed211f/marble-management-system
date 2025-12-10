// components/CustomerSection.jsx
import React from 'react';

const CustomerSection = ({
  userCustomers,
  saleData,
  onCustomerSelect,
  showNewCustomer,
  newCustomer,
  onNewCustomerChange,
  onAddCustomer,
  onSearchCustomer,
  loading,
  setShowNewCustomer,
  setNewCustomer,
  setSaleData
}) => {
  return (
    <div className="card mb-3">
      <div className="card-header">
        <h6 className="mb-0">
          <i className="bi bi-person me-2"></i>
          Customer Information
        </h6>
      </div>
      <div className="card-body">
        <div className="row mb-3">
          <div className="col-md-6">
            <label className="form-label fw-bold">Select Customer *</label>
            <select
              className="form-select"
              name="customerName"
              value={saleData.customerName}
              onChange={onCustomerSelect}
              required
              disabled={loading}
            >
              <option value="">-- Select Customer --</option>
              {userCustomers.map(customer => (
                <option key={customer.id} value={customer.name}>
                  {customer.name} ({customer.phone || 'No phone'})
                </option>
              ))}
              <option value="new">+ Add New Customer</option>
            </select>
          </div>
          <div className="col-md-6 d-flex align-items-end">
            <button 
              type="button" 
              className="btn btn-outline-info btn-sm"
              onClick={onSearchCustomer}
              disabled={loading}
            >
              <i className="bi bi-search me-1"></i>
              Search Customer
            </button>
          </div>
        </div>
        
        {/* Show selected customer */}
        {saleData.customerName && saleData.customerName !== "new" && (
          <div className="alert alert-success d-flex align-items-center">
            <i className="bi bi-person-check me-2 fs-5"></i>
            <div>
              <strong>Selected Customer:</strong> {saleData.customerName}
              {saleData.customerPhone && ` (${saleData.customerPhone})`}
            </div>
          </div>
        )}
        
        {/* New Customer Form */}
        {showNewCustomer && (
          <div className="card bg-light border-primary">
            <div className="card-body">
              <h6 className="text-primary">
                <i className="bi bi-person-plus me-2"></i>
                Add New Customer
              </h6>
              <div className="row g-2 mb-3">
                <div className="col-md-4">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    name="name"
                    value={newCustomer.name}
                    onChange={onNewCustomerChange}
                    placeholder="Full Name *"
                    disabled={loading}
                  />
                </div>
                <div className="col-md-4">
                  <input
                    type="tel"
                    className="form-control form-control-sm"
                    name="phone"
                    value={newCustomer.phone}
                    onChange={onNewCustomerChange}
                    placeholder="Phone Number *"
                    disabled={loading}
                  />
                </div>
                <div className="col-md-4">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    name="address"
                    value={newCustomer.address}
                    onChange={onNewCustomerChange}
                    placeholder="Address (Optional)"
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="d-flex gap-2">
                <button 
                  className="btn btn-success btn-sm"
                  onClick={onAddCustomer}
                  disabled={!newCustomer.name || !newCustomer.phone || loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Adding...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-lg me-1"></i>
                      Add Customer
                    </>
                  )}
                </button>
                <button 
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => {
                    setShowNewCustomer(false);
                    setSaleData(prev => ({ ...prev, customerName: '' }));
                    setNewCustomer({ name: '', phone: '', address: '' });
                  }}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerSection;