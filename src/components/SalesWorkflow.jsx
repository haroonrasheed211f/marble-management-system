// components/SalesWorkflow.jsx - FIXED VERSION
import React, { useState, useEffect } from 'react';

const SalesWorkflow = ({ inventory, addSale, customers, addCustomer, user }) => {
  const [step, setStep] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [saleData, setSaleData] = useState({
    customerName: '',
    customerPhone: '',
    quantity: '',
    salePrice: '',
    remarks: '',
    cementInfo: ''
  });
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // FIX: Filter customers by current user
  const userCustomers = customers.filter(customer => customer.userId === user.uid);

  // FIX: Filter available inventory for current user
  const filteredInventory = inventory.filter(item =>
    item.userId === user.uid &&
    item.quantity > 0 && (
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.marbleType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${item.width}*${item.height}`.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleSelectItem = (item) => {
    setSelectedItem(item);
    setSaleData(prev => ({
      ...prev,
      salePrice: (item.purchasePrice + 20).toFixed(2) // Default 20 PKR profit
    }));
    setStep(2);
  };

  const handleSaleDataChange = (e) => {
    const { name, value } = e.target;
    setSaleData({
      ...saleData,
      [name]: value
    });
  };

  const handleNewCustomerChange = (e) => {
    const { name, value } = e.target;
    setNewCustomer({
      ...newCustomer,
      [name]: value
    });
  };

  // FIX: Handle customer selection
  const handleCustomerSelect = (e) => {
    const selectedCustomerName = e.target.value;
    const selectedCustomer = userCustomers.find(c => c.name === selectedCustomerName);
    
    setSaleData({
      ...saleData,
      customerName: selectedCustomerName,
      customerPhone: selectedCustomer ? selectedCustomer.phone : ''
    });
  };

  // FIX: Improved Add Customer function
  const handleAddCustomer = async (e) => {
    if (e) e.preventDefault();
    
    if (!newCustomer.name || !newCustomer.phone) {
      setMessage({ type: 'error', text: 'Name and phone are required' });
      return;
    }
    
    // Check if customer already exists for this user
    const existingCustomer = userCustomers.find(customer => 
      customer.phone === newCustomer.phone
    );
    
    if (existingCustomer) {
      setMessage({ type: 'error', text: 'Customer with this phone number already exists' });
      return;
    }
    
    try {
      setLoading(true);
      setMessage({ type: '', text: '' });
      
      const result = await addCustomer(newCustomer);
      
      if (result.success) {
        setSaleData({
          ...saleData,
          customerName: newCustomer.name,
          customerPhone: newCustomer.phone
        });
        setNewCustomer({ name: '', phone: '', address: '' });
        setShowNewCustomer(false);
        setMessage({ type: 'success', text: result.message });
        
        // Refresh customers list without reloading page
        setTimeout(() => {
          setMessage({ type: '', text: '' });
        }, 2000);
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error adding customer: ' + error.message });
    } finally {
      setLoading(false);
    }
  };

  // FIX: Search existing customers
  const searchCustomer = () => {
    const searchTerm = prompt("Enter customer name or phone number to search:");
    if (!searchTerm) return;
    
    const foundCustomer = userCustomers.find(customer =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm)
    );
    
    if (foundCustomer) {
      setSaleData({
        ...saleData,
        customerName: foundCustomer.name,
        customerPhone: foundCustomer.phone
      });
      alert(`Customer found: ${foundCustomer.name} (${foundCustomer.phone})`);
    } else {
      alert("No customer found. Please add as new customer.");
      setShowNewCustomer(true);
    }
  };

  // FIX: Calculate profit properly
  const calculateProfit = () => {
    if (!selectedItem || !saleData.quantity || !saleData.salePrice) {
      return { perSqft: 0, total: 0 };
    }
    
    const quantity = parseFloat(saleData.quantity);
    const salePrice = parseFloat(saleData.salePrice);
    const purchasePrice = parseFloat(selectedItem.purchasePrice);
    
    // FIX: User should input sale price directly
    const profitPerSqft = salePrice - purchasePrice;
    const totalProfit = profitPerSqft * quantity;
    
    return {
      perSqft: profitPerSqft,
      total: totalProfit
    };
  };

  // FIX: Validate stock availability
  const validateStock = () => {
    if (!selectedItem || !saleData.quantity) return true;
    
    const requestedQty = parseFloat(saleData.quantity);
    const availableQty = parseFloat(selectedItem.quantity);
    
    if (requestedQty > availableQty) {
      setMessage({ 
        type: 'error', 
        text: `Stock not available! Requested: ${requestedQty} sq.ft, Available: ${availableQty} sq.ft` 
      });
      return false;
    }
    return true;
  };

  const handleCompleteSale = async () => {
    // FIX: Validate all required fields
    if (!selectedItem || !saleData.quantity || !saleData.salePrice || !saleData.customerName) {
      setMessage({ type: 'error', text: 'Please fill all required fields' });
      return;
    }

    // FIX: Validate stock
    if (!validateStock()) {
      return;
    }

    try {
      setLoading(true);
      setMessage({ type: '', text: '' });
      
      const profit = calculateProfit();
      const quantity = parseFloat(saleData.quantity);
      const salePrice = parseFloat(saleData.salePrice);
      const totalAmount = quantity * salePrice;
      
      const saleRecord = {
        inventoryId: selectedItem.id,
        customerName: saleData.customerName,
        customerPhone: saleData.customerPhone,
        marbleType: selectedItem.marbleType,
        itemName: selectedItem.name,
        dimensions: `${selectedItem.width} × ${selectedItem.height} ${selectedItem.unit}`,
        quantity: quantity,
        purchasePrice: selectedItem.purchasePrice,
        salePrice: salePrice,
        profitPerSqft: profit.perSqft,
        totalProfit: profit.total,
        totalAmount: totalAmount,
        remarks: saleData.remarks,
        cementInfo: saleData.cementInfo
      };

      const result = await addSale(saleRecord);
      
      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        
        // Reset form after successful sale
        setTimeout(() => {
          setStep(1);
          setSelectedItem(null);
          setSaleData({
            customerName: '',
            customerPhone: '',
            quantity: '',
            salePrice: '',
            remarks: '',
            cementInfo: ''
          });
          setMessage({ type: '', text: '' });
        }, 2000);
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error completing sale: ' + error.message });
    } finally {
      setLoading(false);
    }
  };

  const profit = calculateProfit();

  return (
    <div>
      <h2 className="mb-2">Sales Workflow</h2>
      <p className="text-muted mb-4">
        <i className="bi bi-person me-1"></i>
        {user.name}'s Sales
      </p>
      
      {message.text && (
        <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'} alert-dismissible fade show mb-4`}>
          <i className={`bi bi-${message.type === 'success' ? 'check-circle' : 'exclamation-triangle'} me-2`}></i>
          {message.text}
          <button type="button" className="btn-close" onClick={() => setMessage({ type: '', text: '' })}></button>
        </div>
      )}
      
      <div className="card">
        <div className="card-header">
          <ul className="nav nav-pills card-header-pills">
            <li className="nav-item">
              <button 
                className={`nav-link ${step === 1 ? 'active' : ''} ${step > 1 ? 'text-success' : ''}`}
                onClick={() => setStep(1)}
                disabled={loading}
              >
                <span className={`badge bg-${step === 1 ? 'light text-dark' : step > 1 ? 'success' : 'secondary'} me-2`}>
                  1
                </span>
                Search Inventory
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${step === 2 ? 'active' : ''} ${step > 2 ? 'text-success' : ''}`}
                onClick={() => selectedItem && setStep(2)}
                disabled={!selectedItem || loading}
              >
                <span className={`badge bg-${step === 2 ? 'light text-dark' : step > 2 ? 'success' : 'secondary'} me-2`}>
                  2
                </span>
                Customer & Negotiation
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${step === 3 ? 'active' : ''}`}
                onClick={() => {
                  if (selectedItem && saleData.quantity && saleData.salePrice && validateStock()) {
                    setStep(3);
                  }
                }}
                disabled={!selectedItem || !saleData.quantity || !saleData.salePrice || loading}
              >
                <span className={`badge bg-${step === 3 ? 'light text-dark' : 'secondary'} me-2`}>
                  3
                </span>
                Complete Sale
              </button>
            </li>
          </ul>
        </div>
        
        <div className="card-body">
          {/* Step 1: Search Inventory */}
          {step === 1 && (
            <div>
              <div className="mb-4">
                <h5>Search Available Marble Stock</h5>
                <p className="text-muted">Search by marble name, type, or dimensions (e.g., "20*60", "Black", "Granite")</p>
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="bi bi-search"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search marble (name, type, or size like 20*60)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>
              
              <div className="row">
                {filteredInventory.length === 0 ? (
                  <div className="col-12 text-center py-5">
                    <i className="bi bi-search fs-1 text-muted mb-3"></i>
                    <p className="text-muted">
                      {searchTerm ? 'No matching items found' : 'No inventory items available'}
                    </p>
                    {searchTerm && (
                      <button 
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => setSearchTerm('')}
                      >
                        Clear search
                      </button>
                    )}
                  </div>
                ) : (
                  filteredInventory.map((item) => (
                    <div key={item.id} className="col-md-6 mb-3">
                      <div className="card h-100">
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <h5 className="card-title">{item.name}</h5>
                              <span className="badge bg-primary mb-2">{item.marbleType}</span>
                              <p className="card-text">
                                <small className="text-muted">
                                  Size: {item.width} × {item.height} {item.unit}<br />
                                  Available: <strong>{item.quantity} sq.ft</strong><br />
                                  Cost: {item.purchasePrice} PKR/sq.ft
                                </small>
                              </p>
                            </div>
                            <div className="text-end">
                              <div className="mb-2">
                                <span className={`badge ${item.quantity < 10 ? 'bg-danger' : 'bg-success'}`}>
                                  Stock: {item.quantity} sq.ft
                                </span>
                              </div>
                              <button 
                                className="btn btn-primary btn-sm"
                                onClick={() => handleSelectItem(item)}
                                disabled={loading}
                              >
                                Select for Sale
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
          
          {/* Step 2: Customer & Negotiation */}
          {step === 2 && selectedItem && (
            <div>
              <div className="row mb-4">
                <div className="col-md-8">
                  <h5>Customer & Sale Details</h5>
                  
                  {/* Selected Item Info */}
                  <div className="card mb-3">
                    <div className="card-body">
                      <div className="row">
                        <div className="col-md-6">
                          <h6>Selected Item</h6>
                          <p className="mb-1"><strong>{selectedItem.name}</strong> ({selectedItem.marbleType})</p>
                          <p className="mb-1">Size: {selectedItem.width} × {selectedItem.height} {selectedItem.unit}</p>
                          <p className="mb-1">Available: <strong className={selectedItem.quantity < 10 ? 'text-danger' : ''}>
                            {selectedItem.quantity} sq.ft
                          </strong></p>
                          <p className="mb-0">Cost Price: {selectedItem.purchasePrice} PKR/sq.ft</p>
                        </div>
                        <div className="col-md-6 text-end">
                          <button 
                            className="btn btn-outline-secondary btn-sm mb-2"
                            onClick={() => {
                              setStep(1);
                              setMessage({ type: '', text: '' });
                            }}
                            disabled={loading}
                          >
                            <i className="bi bi-arrow-left me-1"></i>Change Item
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Customer Section */}
                  <div className="card mb-3">
                    <div className="card-body">
                      <h6>Customer Information</h6>
                      
                      <div className="row mb-3">
                        <div className="col-md-8">
                          <label className="form-label">Select Existing Customer *</label>
                          <div className="input-group">
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
                            </select>
                            <button 
                              type="button" 
                              className="btn btn-outline-secondary"
                              onClick={searchCustomer}
                              disabled={loading}
                            >
                              <i className="bi bi-search"></i>
                            </button>
                          </div>
                        </div>
                        <div className="col-md-4 d-flex align-items-end">
                          <button 
                            type="button" 
                            className="btn btn-link"
                            onClick={() => setShowNewCustomer(!showNewCustomer)}
                            disabled={loading}
                          >
                            + Add New Customer
                          </button>
                        </div>
                      </div>
                      
                      {saleData.customerName && (
                        <div className="alert alert-info">
                          <i className="bi bi-person-check me-2"></i>
                          Selected: <strong>{saleData.customerName}</strong> 
                          {saleData.customerPhone && ` (${saleData.customerPhone})`}
                        </div>
                      )}
                      
                      {/* New Customer Form */}
                      {showNewCustomer && (
                        <div className="card bg-light">
                          <div className="card-body">
                            <h6>New Customer Details</h6>
                            <div className="row">
                              <div className="col-md-4 mb-2">
                                <input
                                  type="text"
                                  className="form-control"
                                  name="name"
                                  value={newCustomer.name}
                                  onChange={handleNewCustomerChange}
                                  placeholder="Name *"
                                  disabled={loading}
                                />
                              </div>
                              <div className="col-md-4 mb-2">
                                <input
                                  type="tel"
                                  className="form-control"
                                  name="phone"
                                  value={newCustomer.phone}
                                  onChange={handleNewCustomerChange}
                                  placeholder="Phone *"
                                  disabled={loading}
                                />
                              </div>
                              <div className="col-md-4 mb-2">
                                <input
                                  type="text"
                                  className="form-control"
                                  name="address"
                                  value={newCustomer.address}
                                  onChange={handleNewCustomerChange}
                                  placeholder="Address"
                                  disabled={loading}
                                />
                              </div>
                            </div>
                            <div className="d-flex gap-2">
                              <button 
                                className="btn btn-success btn-sm"
                                onClick={handleAddCustomer}
                                disabled={!newCustomer.name || !newCustomer.phone || loading}
                              >
                                {loading ? 'Adding...' : 'Add Customer'}
                              </button>
                              <button 
                                className="btn btn-outline-secondary btn-sm"
                                onClick={() => setShowNewCustomer(false)}
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
                  
                  {/* Sale Details */}
                  <div className="card">
                    <div className="card-body">
                      <h6>Sale Details</h6>
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Quantity (sq.ft) *</label>
                          <input
                            type="number"
                            step="0.01"
                            className="form-control"
                            name="quantity"
                            value={saleData.quantity}
                            onChange={handleSaleDataChange}
                            placeholder="Enter quantity"
                            max={selectedItem.quantity}
                            required
                            disabled={loading}
                          />
                          <div className="form-text">
                            Max available: {selectedItem.quantity} sq.ft
                            {saleData.quantity && parseFloat(saleData.quantity) > selectedItem.quantity && (
                              <span className="text-danger ms-2">
                                <i className="bi bi-exclamation-triangle"></i> Exceeds stock!
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Sale Price (per sq.ft) *</label>
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
                            Cost price: {selectedItem.purchasePrice} PKR/sq.ft
                          </div>
                        </div>
                      </div>
                      
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Remarks (Optional)</label>
                          <textarea
                            className="form-control"
                            name="remarks"
                            value={saleData.remarks}
                            onChange={handleSaleDataChange}
                            rows="2"
                            placeholder="Any special notes..."
                            disabled={loading}
                          />
                        </div>
                        
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Cement/Bags Info (Optional)</label>
                          <input
                            type="text"
                            className="form-control"
                            name="cementInfo"
                            value={saleData.cementInfo}
                            onChange={handleSaleDataChange}
                            placeholder="e.g., 2 bags cement included"
                            disabled={loading}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Profit Calculation Sidebar */}
                <div className="col-md-4">
                  <div className="card bg-light sticky-top" style={{top: '20px'}}>
                    <div className="card-header">
                      <h6 className="mb-0">Profit Calculation</h6>
                    </div>
                    <div className="card-body">
                      <div className="mb-3">
                        <div className="d-flex justify-content-between">
                          <span>Sale Price:</span>
                          <span>{saleData.salePrice || '0'} PKR/sq.ft</span>
                        </div>
                        <div className="d-flex justify-content-between">
                          <span>Cost Price:</span>
                          <span>{selectedItem.purchasePrice} PKR/sq.ft</span>
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
                        <div className="d-flex justify-content-between">
                          <span>Quantity:</span>
                          <span>{saleData.quantity || '0'} sq.ft</span>
                        </div>
                        <div className="d-flex justify-content-between">
                          <span>Total Amount:</span>
                          <span>
                            {(saleData.quantity && saleData.salePrice) 
                              ? (parseFloat(saleData.quantity) * parseFloat(saleData.salePrice)).toFixed(2) 
                              : '0'} PKR
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
                          Stock: {selectedItem.quantity} sq.ft
                          {parseFloat(saleData.quantity) > selectedItem.quantity ? ' (Insufficient)' : ' (Available)'}
                        </div>
                      )}
                      
                      <button 
                        className="btn btn-primary w-100"
                        onClick={() => {
                          if (validateStock()) {
                            setStep(3);
                          }
                        }}
                        disabled={!saleData.quantity || !saleData.salePrice || !saleData.customerName || loading}
                      >
                        {loading ? 'Processing...' : 'Continue to Invoice'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Step 3: Complete Sale */}
          {step === 3 && selectedItem && (
            <div>
              <div className="text-center mb-4">
                <i className="bi bi-check-circle text-success fs-1"></i>
                <h4>Ready to Complete Sale</h4>
                <p className="text-muted">Review the details below and complete the sale</p>
              </div>
              
              <div className="row">
                <div className="col-md-8">
                  <div className="card mb-3">
                    <div className="card-body">
                      <div className="row">
                        <div className="col-md-6">
                          <h6>Sale Summary</h6>
                          <table className="table table-sm">
                            <tbody>
                              <tr>
                                <td>Customer:</td>
                                <td><strong>{saleData.customerName}</strong></td>
                              </tr>
                              <tr>
                                <td>Phone:</td>
                                <td>{saleData.customerPhone || '-'}</td>
                              </tr>
                              <tr>
                                <td>Marble:</td>
                                <td>{selectedItem.name} ({selectedItem.marbleType})</td>
                              </tr>
                              <tr>
                                <td>Size:</td>
                                <td>{selectedItem.width} × {selectedItem.height} {selectedItem.unit}</td>
                              </tr>
                              <tr>
                                <td>Quantity:</td>
                                <td>{saleData.quantity} sq.ft</td>
                              </tr>
                              <tr>
                                <td>Rate:</td>
                                <td>{saleData.salePrice} PKR/sq.ft</td>
                              </tr>
                              <tr className="table-primary">
                                <td><strong>Total Amount:</strong></td>
                                <td><strong>{(parseFloat(saleData.quantity) * parseFloat(saleData.salePrice)).toFixed(2)} PKR</strong></td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                        <div className="col-md-6">
                          <h6>Profit Details</h6>
                          <table className="table table-sm">
                            <tbody>
                              <tr>
                                <td>Cost Price:</td>
                                <td>{selectedItem.purchasePrice} PKR/sq.ft</td>
                              </tr>
                              <tr>
                                <td>Sale Price:</td>
                                <td>{saleData.salePrice} PKR/sq.ft</td>
                              </tr>
                              <tr>
                                <td>Profit/sq.ft:</td>
                                <td className={profit.perSqft >= 0 ? 'text-success' : 'text-danger'}>
                                  <strong>{profit.perSqft.toFixed(2)} PKR</strong>
                                </td>
                              </tr>
                              <tr>
                                <td>Quantity:</td>
                                <td>{saleData.quantity} sq.ft</td>
                              </tr>
                              <tr className={profit.total >= 0 ? 'table-success' : 'table-danger'}>
                                <td><strong>Total Profit:</strong></td>
                                <td><strong>{profit.total.toFixed(2)} PKR</strong></td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                      
                      {(saleData.remarks || saleData.cementInfo) && (
                        <div className="mt-3">
                          <h6>Additional Info</h6>
                          {saleData.remarks && (
                            <div className="alert alert-info">
                              <strong>Remarks:</strong> {saleData.remarks}
                            </div>
                          )}
                          {saleData.cementInfo && (
                            <div className="alert alert-warning">
                              <strong>Cement Info:</strong> {saleData.cementInfo}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="col-md-4">
                  <div className="card">
                    <div className="card-body">
                      <h6>Complete Sale</h6>
                      <div className="d-grid gap-2">
                        <button 
                          className="btn btn-success btn-lg"
                          onClick={handleCompleteSale}
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2"></span>
                              Processing...
                            </>
                          ) : (
                            <>
                              <i className="bi bi-check-circle me-2"></i>
                              Complete Sale & Generate Invoice
                            </>
                          )}
                        </button>
                        <button 
                          className="btn btn-outline-secondary"
                          onClick={() => setStep(2)}
                          disabled={loading}
                        >
                          <i className="bi bi-arrow-left me-2"></i>
                          Go Back
                        </button>
                      </div>
                      
                      <div className="mt-3 small text-muted">
                        <p><i className="bi bi-info-circle me-1"></i>
                          This will:
                        </p>
                        <ul className="small">
                          <li>Record the sale transaction</li>
                          <li>Update inventory stock</li>
                          <li>Add to customer ledger</li>
                          <li>Generate invoice number</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalesWorkflow;