// components/InventoryManagement.jsx
import React, { useState } from 'react';

const InventoryManagement = ({ inventory, addInventoryItem, user }) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    marbleType: 'Granite',
    name: '',
    width: '',
    height: '',
    unit: 'inches',
    purchasePrice: '',
    quantity: '',
    supplier: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const calculateSqft = (width, height, unit) => {
    if (!width || !height) return 0;
    const w = parseFloat(width);
    const h = parseFloat(height);
    
    if (unit === 'inches') {
      return (w * h) / 144;
    } else {
      return w * h;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setMessage({ type: '', text: '' });
      
      // Validate inputs
      if (!formData.name || !formData.width || !formData.height || !formData.purchasePrice || !formData.quantity) {
        setMessage({ type: 'error', text: 'Please fill all required fields' });
        setLoading(false);
        return;
      }
      
      // Check if user is authenticated
      if (!user || !user.uid) {
        setMessage({ type: 'error', text: 'You need to login again' });
        setLoading(false);
        return;
      }
      
      const sqft = calculateSqft(formData.width, formData.height, formData.unit);
      
      const newItem = {
        marbleType: formData.marbleType,
        name: formData.name,
        width: parseFloat(formData.width),
        height: parseFloat(formData.height),
        unit: formData.unit,
        sqft: parseFloat(sqft.toFixed(2)),
        purchasePrice: parseFloat(formData.purchasePrice),
        quantity: parseFloat(formData.quantity),
        supplier: formData.supplier || ''
      };
      
      console.log("Submitting item:", newItem);
      
      const result = await addInventoryItem(newItem);
      
      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        setFormData({
          marbleType: 'Granite',
          name: '',
          width: '',
          height: '',
          unit: 'inches',
          purchasePrice: '',
          quantity: '',
          supplier: ''
        });
        setTimeout(() => setShowForm(false), 1500);
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      console.error("Submit Error:", error);
      setMessage({ type: 'error', text: 'Error adding item: ' + error.message });
    } finally {
      setLoading(false);
    }
  };

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.marbleType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.supplier && item.supplier.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString();
    } catch (error) {
      return 'Invalid Date';
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Inventory Management</h2>
          <small className="text-muted">
            <i className="bi bi-person me-1"></i>
            {user.name}'s Inventory
          </small>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={() => setShowForm(true)}
          disabled={loading}
        >
          <i className="bi bi-plus-circle me-2"></i>Add New Item
        </button>
      </div>
      
      {message.text && (
        <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'} alert-dismissible fade show mb-4`} role="alert">
          <i className={`bi bi-${message.type === 'success' ? 'check-circle' : 'exclamation-triangle'} me-2`}></i>
          {message.text}
          <button type="button" className="btn-close" onClick={() => setMessage({ type: '', text: '' })}></button>
        </div>
      )}
      
      {showForm && (
        <div className="card mb-4">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Add New Marble Item</h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => {
                setShowForm(false);
                setMessage({ type: '', text: '' });
              }}
              disabled={loading}
            ></button>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Marble Type <span className="text-danger">*</span></label>
                  <select
                    className="form-select"
                    name="marbleType"
                    value={formData.marbleType}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  >
                    <option value="Granite">Granite</option>
                    <option value="Graphite">Graphite</option>
                    <option value="Tiles">Tiles</option>
                    <option value="Large Sheets">Large Sheets</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>
                
                <div className="col-md-6 mb-3">
                  <label className="form-label">Item Name / Category <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g., Black Galaxy, Silver Grey"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
              
              <div className="row">
                <div className="col-md-3 mb-3">
                  <label className="form-label">Width <span className="text-danger">*</span></label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    name="width"
                    value={formData.width}
                    onChange={handleChange}
                    placeholder="e.g., 24.5"
                    required
                    disabled={loading}
                  />
                </div>
                
                <div className="col-md-3 mb-3">
                  <label className="form-label">Height <span className="text-danger">*</span></label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    name="height"
                    value={formData.height}
                    onChange={handleChange}
                    placeholder="e.g., 60.0"
                    required
                    disabled={loading}
                  />
                </div>
                
                <div className="col-md-3 mb-3">
                  <label className="form-label">Unit <span className="text-danger">*</span></label>
                  <select
                    className="form-select"
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  >
                    <option value="inches">Inches</option>
                    <option value="feet">Feet</option>
                  </select>
                </div>
                
                <div className="col-md-3 mb-3">
                  <label className="form-label">Calculated Sq.Ft</label>
                  <input
                    type="text"
                    className="form-control bg-light"
                    value={calculateSqft(formData.width, formData.height, formData.unit).toFixed(2)}
                    readOnly
                  />
                </div>
              </div>
              
              <div className="row">
                <div className="col-md-4 mb-3">
                  <label className="form-label">Purchase Price (per sq.ft) <span className="text-danger">*</span></label>
                  <div className="input-group">
                    <span className="input-group-text">PKR</span>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      name="purchasePrice"
                      value={formData.purchasePrice}
                      onChange={handleChange}
                      placeholder="Price per sq.ft"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
                
                <div className="col-md-4 mb-3">
                  <label className="form-label">Available Quantity (sq.ft) <span className="text-danger">*</span></label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    placeholder="Quantity in sq.ft"
                    required
                    disabled={loading}
                  />
                </div>
                
                <div className="col-md-4 mb-3">
                  <label className="form-label">Supplier</label>
                  <input
                    type="text"
                    className="form-control"
                    name="supplier"
                    value={formData.supplier}
                    onChange={handleChange}
                    placeholder="Supplier name"
                    disabled={loading}
                  />
                </div>
              </div>
              
              <div className="d-flex justify-content-end">
                <button 
                  type="button" 
                  className="btn btn-secondary me-2" 
                  onClick={() => {
                    setShowForm(false);
                    setMessage({ type: '', text: '' });
                  }}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Adding...
                    </>
                  ) : 'Add to Inventory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Inventory List</h5>
          <div className="col-md-4">
            <div className="input-group">
              <span className="input-group-text"><i className="bi bi-search"></i></span>
              <input
                type="text"
                className="form-control"
                placeholder="Search by name, type, or supplier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="card-body">
          {filteredInventory.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-box-seam fs-1 text-muted mb-3"></i>
              <p className="text-muted">
                {searchTerm ? 'No inventory items found for your search' : 'No inventory items found'}
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
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Name</th>
                    <th>Dimensions</th>
                    <th>Sq.Ft</th>
                    <th>Purchase Price</th>
                    <th>Available</th>
                    <th>Total Value</th>
                    <th>Supplier</th>
                    <th>Entry Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInventory.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <span className="badge bg-primary">{item.marbleType}</span>
                      </td>
                      <td>{item.name}</td>
                      <td>{item.width} × {item.height} {item.unit}</td>
                      <td>{item.sqft}</td>
                      <td>{item.purchasePrice} PKR</td>
                      <td>
                        <span className={item.quantity < 10 ? 'text-danger fw-bold' : ''}>
                          {item.quantity} sq.ft
                        </span>
                      </td>
                      <td>{item.totalValue ? item.totalValue.toLocaleString() : 'N/A'} PKR</td>
                      <td>{item.supplier || '-'}</td>
                      <td>{formatDate(item.entryDate)}</td>
                      <td>
                        {item.quantity < 10 ? (
                          <span className="badge bg-danger">Low Stock</span>
                        ) : (
                          <span className="badge bg-success">In Stock</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          <div className="mt-3 text-muted small">
            <i className="bi bi-info-circle me-1"></i>
            Showing {filteredInventory.length} of {inventory.length} items
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryManagement;