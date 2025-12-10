// components/SalesWorkflow.jsx - FIXED VERSION (with custom modal)
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
  const [customerAdded, setCustomerAdded] = useState(false);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: '',
    message: '',
    type: 'info',
    onConfirm: null,
    showConfirm: false
  });
  
  // Filter customers by current user
  const userCustomers = customers.filter(customer => customer.userId === user.uid);

  // Filter available inventory for current user
  const filteredInventory = inventory.filter(item =>
    item.userId === user.uid &&
    item.quantity > 0 && (
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.marbleType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${item.width}*${item.height}`.toLowerCase().includes(searchTerm.replace(/\s+/g, '').toLowerCase()) ||
      `${item.width}x${item.height}`.toLowerCase().includes(searchTerm.replace(/\s+/g, '').toLowerCase())
    )
  );

  // Automatically select customer when added
  useEffect(() => {
    if (customerAdded && newCustomer.name) {
      setSaleData(prev => ({
        ...prev,
        customerName: newCustomer.name,
        customerPhone: newCustomer.phone
      }));
      setCustomerAdded(false);
    }
  }, [customerAdded, newCustomer]);

  // Custom modal function
  const showCustomModal = (title, message, type = 'info', onConfirm = null) => {
    setModalContent({
      title,
      message,
      type,
      onConfirm,
      showConfirm: onConfirm !== null
    });
    setShowModal(true);
  };

  // Custom prompt function
  const showCustomPrompt = (title, message, defaultValue = '') => {
    return new Promise((resolve) => {
      setModalContent({
        title,
        message,
        type: 'prompt',
        defaultValue,
        resolve,
        showInput: true
      });
      setShowModal(true);
    });
  };

  // Custom confirm function
  const showCustomConfirm = (title, message) => {
    return new Promise((resolve) => {
      setModalContent({
        title,
        message,
        type: 'confirm',
        onConfirm: () => resolve(true),
        onCancel: () => resolve(false),
        showConfirm: true
      });
      setShowModal(true);
    });
  };

  const handleSelectItem = (item) => {
    setSelectedItem(item);
    // Suggest a sale price (purchase price + 20%)
    const suggestedPrice = (item.purchasePrice * 1.2).toFixed(2);
    setSaleData(prev => ({
      ...prev,
      salePrice: suggestedPrice
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

  // Handle customer selection from dropdown
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

  // FIXED: Add Customer without page reload
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
        
        // Set flag to trigger auto-selection
        setCustomerAdded(true);
        
        // Don't reset form, stay on same step
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

  // Search existing customers - FIXED to use custom modal
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
          showCustomModal(
            "Customer Selected",
            `Customer selected: ${selectedCustomer.name}`,
            "success"
          );
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

  // Calculate profit
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

  // Validate stock availability
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

  // Complete sale
  const handleCompleteSale = async () => {
    // Validate all required fields
    if (!selectedItem || !saleData.quantity || !saleData.salePrice || !saleData.customerName) {
      setMessage({ 
        type: 'error', 
        text: '❌ Please fill all required fields:\n- Customer Name\n- Quantity\n- Sale Price' 
      });
      return;
    }

    // Validate stock
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
        setMessage({ 
          type: 'success', 
          text: `✅ Sale completed successfully!\nInvoice generated.\nProfit: ${profit.total.toFixed(2)} PKR` 
        });
        
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
          setNewCustomer({
            name: '',
            phone: '',
            address: ''
          });
          setShowNewCustomer(false);
          setMessage({ type: '', text: '' });
        }, 3000);
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '❌ Error completing sale: ' + error.message });
    } finally {
      setLoading(false);
    }
  };

  const profit = calculateProfit();

  // Modal Component
  const Modal = () => {
    const [inputValue, setInputValue] = useState(modalContent.defaultValue || '');

    const handleConfirm = () => {
      if (modalContent.type === 'prompt' && modalContent.resolve) {
        modalContent.resolve(inputValue);
      } else if (modalContent.onConfirm) {
        modalContent.onConfirm();
      }
      setShowModal(false);
    };

    const handleCancel = () => {
      if (modalContent.type === 'prompt' && modalContent.resolve) {
        modalContent.resolve('');
      } else if (modalContent.onCancel) {
        modalContent.onCancel();
      }
      setShowModal(false);
    };

    if (!showModal) return null;

    return (
      <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{modalContent.title}</h5>
              <button type="button" className="btn-close" onClick={handleCancel}></button>
            </div>
            <div className="modal-body">
              <div style={{ whiteSpace: 'pre-line' }}>{modalContent.message}</div>
              {modalContent.showInput && (
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
                {modalContent.type === 'confirm' ? 'No' : 'Cancel'}
              </button>
              <button type="button" className="btn btn-primary" onClick={handleConfirm}>
                {modalContent.type === 'confirm' ? 'Yes' : 'OK'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div>
        <h2 className="mb-2">Sales Workflow</h2>
        <p className="text-muted mb-4">
          <i className="bi bi-person me-1"></i>
          {user.name}'s Sales
        </p>
        
        {message.text && (
          <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'} alert-dismissible fade show mb-4`}>
            <div className="d-flex align-items-center">
              <i className={`bi ${message.type === 'success' ? 'bi-check-circle' : 'bi-exclamation-triangle'} me-2 fs-4`}></i>
              <div style={{ whiteSpace: 'pre-line' }}>{message.text}</div>
            </div>
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
                  Customer & Sale Details
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link ${step === 3 ? 'active' : ''}`}
                  onClick={() => {
                    if (selectedItem && saleData.quantity && saleData.salePrice && saleData.customerName && validateStock()) {
                      setStep(3);
                    }
                  }}
                  disabled={!selectedItem || !saleData.quantity || !saleData.salePrice || !saleData.customerName || loading}
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
                  <p className="text-muted">
                    Search by marble name, type, or dimensions (e.g., "20*60", "Black Galaxy", "Granite")
                  </p>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-search"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Type name, type, or size like 20*60..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      disabled={loading}
                    />
                    <button 
                      className="btn btn-outline-secondary"
                      onClick={() => setSearchTerm('')}
                      disabled={!searchTerm || loading}
                    >
                      Clear
                    </button>
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
                                    <i className="bi bi-rulers me-1"></i>
                                    Size: {item.width} × {item.height} {item.unit}<br />
                                    <i className="bi bi-box me-1"></i>
                                    Available: <strong>{parseFloat(item.quantity).toFixed(2)} sq.ft</strong><br />
                                    <i className="bi bi-currency-dollar me-1"></i>
                                    Cost: {parseFloat(item.purchasePrice).toFixed(2)} PKR/sq.ft
                                  </small>
                                </p>
                              </div>
                              <div className="text-end">
                                <div className="mb-2">
                                  <span className={`badge ${item.quantity < 10 ? 'bg-danger' : 'bg-success'}`}>
                                    <i className="bi bi-box me-1"></i>
                                    {parseFloat(item.quantity).toFixed(2)} sq.ft
                                  </span>
                                </div>
                                <button 
                                  className="btn btn-primary btn-sm"
                                  onClick={() => handleSelectItem(item)}
                                  disabled={loading}
                                >
                                  <i className="bi bi-cart-plus me-1"></i>
                                  Select
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
            
            {/* Step 2: Customer & Sale Details */}
            {step === 2 && selectedItem && (
              <div>
                <div className="row mb-4">
                  <div className="col-md-8">
                    {/* Selected Item Info Card */}
                    <div className="card mb-3">
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <h5 className="card-title mb-1">
                              <i className="bi bi-box-seam me-2"></i>
                              {selectedItem.name}
                            </h5>
                            <span className="badge bg-primary me-2">{selectedItem.marbleType}</span>
                            <span className="badge bg-info me-2">
                              {selectedItem.width} × {selectedItem.height} {selectedItem.unit}
                            </span>
                            <span className={`badge ${selectedItem.quantity < 10 ? 'bg-danger' : 'bg-success'}`}>
                              Available: {parseFloat(selectedItem.quantity).toFixed(2)} sq.ft
                            </span>
                            <p className="mt-2 mb-0">
                              <i className="bi bi-currency-dollar me-1"></i>
                              <strong>Cost Price:</strong> {parseFloat(selectedItem.purchasePrice).toFixed(2)} PKR/sq.ft
                            </p>
                          </div>
                          <button 
                            className="btn btn-outline-secondary btn-sm"
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
                    
                    {/* Customer Section */}
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
                          <div className="col-md-6 d-flex align-items-end">
                            <button 
                              type="button" 
                              className="btn btn-outline-info btn-sm"
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
                          <div className="alert alert-success d-flex align-items-center">
                            <i className="bi bi-person-check me-2 fs-5"></i>
                            <div>
                              <strong>Selected Customer:</strong> {saleData.customerName}
                              {saleData.customerPhone && ` (${saleData.customerPhone})`}
                            </div>
                          </div>
                        )}
                        
                        {/* New Customer Form - Only shown when "Add New Customer" is selected */}
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
                                    onChange={handleNewCustomerChange}
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
                                    onChange={handleNewCustomerChange}
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
                                    onChange={handleNewCustomerChange}
                                    placeholder="Address (Optional)"
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
                    
                    {/* Sale Details */}
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
                  
                  {/* Right Sidebar - Profit Calculation */}
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
                          
                          {saleData.quantity && parseFloat(saleData.quantity) > selectedItem.quantity && (
                            <button 
                              className="btn btn-warning"
                              onClick={() => {
                                showCustomModal(
                                  "Low Stock Alert",
                                  `Low stock alert!\n\nPlease:\n1. Reduce quantity to ${selectedItem.quantity} sq.ft\n2. OR add more stock to inventory\n3. OR contact supplier for restocking`
                                );
                              }}
                            >
                              <i className="bi bi-exclamation-triangle me-2"></i>
                              Low Stock - Add More
                            </button>
                          )}
                        </div>
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
                            <h6>
                              <i className="bi bi-receipt me-2"></i>
                              Sale Summary
                            </h6>
                            <table className="table table-sm">
                              <tbody>
                                <tr>
                                  <td><strong>Customer:</strong></td>
                                  <td>{saleData.customerName}</td>
                                </tr>
                                <tr>
                                  <td><strong>Phone:</strong></td>
                                  <td>{saleData.customerPhone || '-'}</td>
                                </tr>
                                <tr>
                                  <td><strong>Marble:</strong></td>
                                  <td>{selectedItem.name} ({selectedItem.marbleType})</td>
                                </tr>
                                <tr>
                                  <td><strong>Size:</strong></td>
                                  <td>{selectedItem.width} × {selectedItem.height} {selectedItem.unit}</td>
                                </tr>
                                <tr>
                                  <td><strong>Quantity:</strong></td>
                                  <td>{parseFloat(saleData.quantity).toFixed(2)} sq.ft</td>
                                </tr>
                                <tr>
                                  <td><strong>Rate:</strong></td>
                                  <td>{parseFloat(saleData.salePrice).toFixed(2)} PKR/sq.ft</td>
                                </tr>
                                <tr className="table-primary">
                                  <td><strong>Total Amount:</strong></td>
                                  <td><strong>{(parseFloat(saleData.quantity) * parseFloat(saleData.salePrice)).toFixed(2)} PKR</strong></td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                          <div className="col-md-6">
                            <h6>
                              <i className="bi bi-graph-up me-2"></i>
                              Profit Details
                            </h6>
                            <table className="table table-sm">
                              <tbody>
                                <tr>
                                  <td><strong>Cost Price:</strong></td>
                                  <td>{parseFloat(selectedItem.purchasePrice).toFixed(2)} PKR/sq.ft</td>
                                </tr>
                                <tr>
                                  <td><strong>Sale Price:</strong></td>
                                  <td>{parseFloat(saleData.salePrice).toFixed(2)} PKR/sq.ft</td>
                                </tr>
                                <tr>
                                  <td><strong>Profit/sq.ft:</strong></td>
                                  <td className={profit.perSqft >= 0 ? 'text-success' : 'text-danger'}>
                                    <strong>{profit.perSqft.toFixed(2)} PKR</strong>
                                  </td>
                                </tr>
                                <tr>
                                  <td><strong>Total Profit:</strong></td>
                                  <td className={profit.total >= 0 ? 'text-success' : 'text-danger'}>
                                    <strong>{profit.total.toFixed(2)} PKR</strong>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                        
                        {/* Additional Info */}
                        {(saleData.remarks || saleData.cementInfo) && (
                          <div className="mt-3">
                            <h6>
                              <i className="bi bi-info-circle me-2"></i>
                              Additional Information
                            </h6>
                            {saleData.remarks && (
                              <div className="alert alert-info mb-2">
                                <strong>Remarks:</strong> {saleData.remarks}
                              </div>
                            )}
                            {saleData.cementInfo && (
                              <div className="alert alert-warning mb-0">
                                <strong>Cement/Bags Info:</strong> {saleData.cementInfo}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Complete Sale Actions */}
                  <div className="col-md-4">
                    <div className="card">
                      <div className="card-body">
                        <h6>
                          <i className="bi bi-check2-circle me-2"></i>
                          Complete Sale
                        </h6>
                        <div className="d-grid gap-2">
                          <button 
                            className="btn btn-success btn-lg"
                            onClick={handleCompleteSale}
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
                            Go Back to Edit
                          </button>
                        </div>
                        
                        <div className="mt-3 small text-muted">
                          <p>
                            <i className="bi bi-info-circle me-1"></i>
                            <strong>This will:</strong>
                          </p>
                          <ul>
                            <li>Record the sale transaction</li>
                            <li>Update inventory stock automatically</li>
                            <li>Add to customer's purchase history</li>
                            <li>Generate invoice number</li>
                            <li>Calculate and record profit</li>
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
      
      {/* Custom Modal Component */}
      <Modal />
    </>
  );
};

export default SalesWorkflow;