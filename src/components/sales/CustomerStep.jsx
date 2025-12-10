// components/CustomerStep.jsx
import React, { useState } from 'react';

const CustomerStep = ({
  userCustomers,
  saleData,
  setSaleData,
  loading,
  setLoading,
  setMessage,
  addCustomer,
  showCustomPrompt,
  showCustomConfirm,
  onCustomerSelect
}) => {
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone: '',
    address: ''
  });

  const handleNewCustomerChange = (e) => {
    const { name, value } = e.target;
    setNewCustomer(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCustomerSelect = (e) => {
    const selectedCustomerName = e.target.value;
    if (selectedCustomerName === "new") {
      setShowNewCustomer(true);
      setSaleData(prev => ({
        ...prev,
        customerName: '',
        customerPhone: ''
      }));
      return;
    }
    
    const selectedCustomer = userCustomers.find(c => c.name === selectedCustomerName);
    
    if (selectedCustomer) {
      setSaleData({
        ...saleData,
        customerName: selectedCustomer.name,
        customerPhone: selectedCustomer.phone
      });
      setShowNewCustomer(false);
    }
  };

  const handleAddCustomer = async (e) => {
    if (e) e.preventDefault();
    
    if (!newCustomer.name || !newCustomer.phone) {
      setMessage({ type: 'error', text: 'Name and phone are required' });
      return;
    }
    
    const existingCustomer = userCustomers.find(customer => 
      customer.phone === newCustomer.phone
    );
    
    if (existingCustomer) {
      setMessage({ 
        type: 'error', 
        text: `Customer with phone ${newCustomer.phone} already exists!` 
      });
      return;
    }
    
    try {
      setLoading(true);
      setMessage({ type: '', text: '' });
      
      const result = await addCustomer(newCustomer);
      
      if (result.success) {
        setMessage({ 
          type: 'success', 
          text: `Customer ${newCustomer.name} added successfully!` 
        });
        
        // Auto-select the new customer
        setSaleData({
          ...saleData,
          customerName: newCustomer.name,
          customerPhone: newCustomer.phone
        });
        
        setShowNewCustomer(false);
        setNewCustomer({ name: '', phone: '', address: '' });
        
        setTimeout(() => {
          setMessage({ type: '', text: '' });
        }, 3000);
        
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error adding customer: ' + error.message });
    } finally {
      setLoading(false);
    }
  };

  const searchCustomer = async () => {
    const searchTerm = await showCustomPrompt(
      "Search Customer",
      "Enter customer name or phone number to search:"
    );
    
    if (!searchTerm) return;
    
    const foundCustomers = userCustomers.filter(customer =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.phone && customer.phone.includes(searchTerm))
    );
    
    if (foundCustomers.length > 0) {
      const customerList = foundCustomers.map(c => 
        `${c.name} (${c.phone || 'No phone'})`
      ).join('\n');
      
      const selected = await showCustomPrompt(
        `Found ${foundCustomers.length} customer(s)`,
        `${customerList}\n\nEnter the exact name to select:`
      );
      
      if (selected) {
        const selectedCustomer = foundCustomers.find(c => c.name === selected);
        if (selectedCustomer) {
          setSaleData({
            ...saleData,
            customerName: selectedCustomer.name,
            customerPhone: selectedCustomer.phone
          });
        }
      }
    } else {
      const addNew = await showCustomConfirm(
        "No Customer Found",
        "No customer found. Would you like to add as new customer?"
      );
      
      if (addNew) {
        setShowNewCustomer(true);
        setNewCustomer(prev => ({
          ...prev,
          phone: searchTerm
        }));
      }
    }
  };

  return (
    <div>
      <div className="text-center mb-4">
        <i className="bi bi-person-circle text-primary fs-1"></i>
        <h4>Select Customer</h4>
        <p className="text-muted">Choose or add a customer to proceed with the sale</p>
      </div>
      
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-body">
              <div className="mb-4">
                <h5 className="card-title">
                  <i className="bi bi-person me-2"></i>
                  Customer Information
                </h5>
                <p className="text-muted">Select existing customer or add new customer</p>
                
                <div className="row mb-3">
                  <div className="col-md-8">
                    <label className="form-label fw-bold">Select Customer *</label>
                    <select
                      className="form-select"
                      name="customerName"
                      value={saleData.customerName}
                      onChange={handleCustomerSelect}
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
                  <div className="col-md-4 d-flex align-items-end">
                    <button 
                      type="button" 
                      className="btn btn-outline-info btn-sm w-100"
                      onClick={searchCustomer}
                      disabled={loading}
                    >
                      <i className="bi bi-search me-1"></i>
                      Search Customer
                    </button>
                  </div>
                </div>
                
                {/* Show selected customer */}
                {saleData.customerName && saleData.customerName !== "new" && (
                  <div className="alert alert-success d-flex align-items-center mb-3">
                    <i className="bi bi-person-check me-2 fs-5"></i>
                    <div>
                      <strong>Selected Customer:</strong> {saleData.customerName}
                      {saleData.customerPhone && ` (${saleData.customerPhone})`}
                    </div>
                  </div>
                )}
                
                {/* New Customer Form */}
                {showNewCustomer && (
                  <div className="card bg-light border-primary mb-3">
                    <div className="card-body">
                      <h6 className="text-primary">
                        <i className="bi bi-person-plus me-2"></i>
                        Add New Customer
                      </h6>
                      <div className="row g-3 mb-3">
                        <div className="col-md-4">
                          <label className="form-label">Full Name *</label>
                          <input
                            type="text"
                            className="form-control"
                            name="name"
                            value={newCustomer.name}
                            onChange={handleNewCustomerChange}
                            placeholder="Enter full name"
                            disabled={loading}
                          />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label">Phone Number *</label>
                          <input
                            type="tel"
                            className="form-control"
                            name="phone"
                            value={newCustomer.phone}
                            onChange={handleNewCustomerChange}
                            placeholder="Enter phone number"
                            disabled={loading}
                          />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label">Address (Optional)</label>
                          <input
                            type="text"
                            className="form-control"
                            name="address"
                            value={newCustomer.address}
                            onChange={handleNewCustomerChange}
                            placeholder="Enter address"
                            disabled={loading}
                          />
                        </div>
                      </div>
                      <div className="d-flex gap-2">
                        <button 
                          className="btn btn-success"
                          onClick={handleAddCustomer}
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
                          className="btn btn-outline-secondary"
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
              
              <div className="d-flex justify-content-between">
                <div>
                  <small className="text-muted">
                    <i className="bi bi-info-circle me-1"></i>
                    Step 1 of 3: Customer Selection
                  </small>
                </div>
                <button 
                  className="btn btn-primary"
                  onClick={() => onCustomerSelect(saleData)}
                  disabled={!saleData.customerName || loading}
                >
                  Next: Search Inventory 
                  <i className="bi bi-arrow-right ms-2"></i>
                </button>
              </div>
            </div>
          </div>
          
          {/* Customer List */}
          {userCustomers.length > 0 && (
            <div className="card mt-3">
              <div className="card-header">
                <h6 className="mb-0">
                  <i className="bi bi-people me-2"></i>
                  Your Customers ({userCustomers.length})
                </h6>
              </div>
              <div className="card-body">
                <div className="row">
                  {userCustomers.slice(0, 6).map(customer => (
                    <div key={customer.id} className="col-md-6 mb-2">
                      <div 
                        className={`p-2 border rounded ${saleData.customerName === customer.name ? 'bg-primary text-white' : 'bg-light'}`}
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                          setSaleData({
                            ...saleData,
                            customerName: customer.name,
                            customerPhone: customer.phone
                          });
                          setShowNewCustomer(false);
                        }}
                      >
                        <div className="d-flex justify-content-between">
                          <div>
                            <strong>{customer.name}</strong>
                            <div className="small">
                              {customer.phone || 'No phone'}
                            </div>
                          </div>
                          {saleData.customerName === customer.name && (
                            <i className="bi bi-check-circle"></i>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerStep;