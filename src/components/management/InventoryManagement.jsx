// components/management/InventoryManagement.jsx - UPDATED WITH TOASTIFY
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const InventoryManagement = ({ inventory, addInventoryItem, updateInventoryItem, deleteInventoryItem, user }) => {
  const [showForm, setShowForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
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
  const [showLowStock, setShowLowStock] = useState(false);

  // Filter inventory by current user
  const userInventory = inventory.filter(item => item.userId === user.uid);
  
  // Filter inventory based on search
  const filteredInventory = userInventory.filter(item => {
    if (showLowStock && item.quantity >= 10) return false;
    
    return (
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.marbleType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.supplier && item.supplier.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  // Calculate low stock items
  const lowStockItems = userInventory.filter(item => item.quantity < 10);

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

  // Toast notification functions
  const showSuccessToast = (message) => {
    toast.success(message, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: "light",
    });
  };

  const showErrorToast = (message) => {
    toast.error(message, {
      position: "top-right",
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: "light",
    });
  };

  const showInfoToast = (message) => {
    toast.info(message, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  const showWarningToast = (message) => {
    toast.warning(message, {
      position: "top-right",
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  // Add new inventory item
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Validate inputs
      if (!formData.name || !formData.width || !formData.height || !formData.purchasePrice || !formData.quantity) {
        showErrorToast('Please fill all required fields');
        setLoading(false);
        return;
      }
      
      const sqft = calculateSqft(formData.width, formData.height, formData.unit);
      const totalValue = formData.purchasePrice * formData.quantity;
      
      const newItem = {
        marbleType: formData.marbleType,
        name: formData.name,
        width: parseFloat(formData.width),
        height: parseFloat(formData.height),
        unit: formData.unit,
        sqft: parseFloat(sqft.toFixed(2)),
        purchasePrice: parseFloat(formData.purchasePrice),
        quantity: parseFloat(formData.quantity),
        totalValue: totalValue,
        supplier: formData.supplier || '',
        entryDate: new Date().toISOString()
      };
      
      // Show loading toast
      const loadingToastId = toast.loading("Adding inventory item...");
      
      const result = await addInventoryItem(newItem);
      
      // Dismiss loading toast
      toast.dismiss(loadingToastId);
      
      if (result.success) {
        showSuccessToast(`✅ ${result.message}`);
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
        setTimeout(() => {
          setShowForm(false);
        }, 1000);
      } else {
        showErrorToast(`❌ ${result.message}`);
      }
    } catch (error) {
      console.error("Submit Error:", error);
      showErrorToast(`Error adding item: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Edit inventory item
  const handleEditClick = (item) => {
    setEditingItem(item);
    setFormData({
      marbleType: item.marbleType,
      name: item.name,
      width: item.width,
      height: item.height,
      unit: item.unit,
      purchasePrice: item.purchasePrice,
      quantity: item.quantity,
      supplier: item.supplier || ''
    });
    setShowEditForm(true);
    showInfoToast(`Editing: ${item.name}`);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      if (!editingItem) return;
      
      // Validate inputs
      if (!formData.name || !formData.width || !formData.height || !formData.purchasePrice || !formData.quantity) {
        showErrorToast('Please fill all required fields');
        setLoading(false);
        return;
      }
      
      const sqft = calculateSqft(formData.width, formData.height, formData.unit);
      const totalValue = formData.purchasePrice * formData.quantity;
      
      const updatedData = {
        marbleType: formData.marbleType,
        name: formData.name,
        width: parseFloat(formData.width),
        height: parseFloat(formData.height),
        unit: formData.unit,
        sqft: parseFloat(sqft.toFixed(2)),
        purchasePrice: parseFloat(formData.purchasePrice),
        quantity: parseFloat(formData.quantity),
        totalValue: totalValue,
        supplier: formData.supplier || ''
      };
      
      // Show loading toast
      const loadingToastId = toast.loading("Updating item...");
      
      const result = await updateInventoryItem(editingItem.id, updatedData);
      
      // Dismiss loading toast
      toast.dismiss(loadingToastId);
      
      if (result.success) {
        showSuccessToast(`✅ ${result.message}`);
        setTimeout(() => {
          setShowEditForm(false);
          setEditingItem(null);
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
        }, 1000);
      } else {
        showErrorToast(`❌ ${result.message}`);
      }
    } catch (error) {
      console.error("Update Error:", error);
      showErrorToast(`Error updating item: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Delete inventory item with confirmation
  const handleDeleteClick = async (item) => {
    // Custom confirmation dialog
    toast.warning(
      <div>
        <h6>Delete Item</h6>
        <p>Are you sure you want to delete "{item.name}"?</p>
        <div className="d-flex gap-2 mt-3">
          <button 
            className="btn btn-sm btn-danger flex-grow-1"
            onClick={() => {
              toast.dismiss();
              confirmDeleteItem(item);
            }}
          >
            Yes, Delete
          </button>
          <button 
            className="btn btn-sm btn-secondary flex-grow-1"
            onClick={() => toast.dismiss()}
          >
            Cancel
          </button>
        </div>
      </div>,
      {
        position: "top-center",
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        closeButton: false,
        theme: "light",
      }
    );
  };

  const confirmDeleteItem = async (item) => {
    try {
      setLoading(true);
      
      const loadingToastId = toast.loading("Deleting item...");
      
      const result = await deleteInventoryItem(item.id);
      
      toast.dismiss(loadingToastId);
      
      if (result.success) {
        showSuccessToast(`🗑️ ${result.message}`);
      } else {
        showErrorToast(`❌ ${result.message}`);
      }
    } catch (error) {
      console.error("Delete Error:", error);
      showErrorToast(`Error deleting item: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Quick add stock with better dialog
  const handleQuickAddStock = async (item) => {
    toast.info(
      <div>
        <h6>Add Stock: {item.name}</h6>
        <p className="mb-2">Current stock: <strong>{item.quantity} sq.ft</strong></p>
        <input
          type="number"
          id="stockAmount"
          className="form-control mb-3"
          placeholder="Enter amount to add (sq.ft)"
          step="0.01"
          min="0.01"
          autoFocus
        />
        <div className="d-flex gap-2">
          <button 
            className="btn btn-sm btn-success flex-grow-1"
            onClick={() => {
              const amountInput = document.getElementById('stockAmount');
              const amount = amountInput.value;
              if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
                showErrorToast("Please enter a valid amount!");
                return;
              }
              toast.dismiss();
              confirmAddStock(item, amount);
            }}
          >
            Add Stock
          </button>
          <button 
            className="btn btn-sm btn-secondary flex-grow-1"
            onClick={() => toast.dismiss()}
          >
            Cancel
          </button>
        </div>
      </div>,
      {
        position: "top-center",
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        closeButton: false,
        theme: "light",
      }
    );
  };

  const confirmAddStock = async (item, addAmount) => {
    try {
      setLoading(true);
      
      const loadingToastId = toast.loading(`Adding ${addAmount} sq.ft...`);
      
      const newQuantity = parseFloat(item.quantity) + parseFloat(addAmount);
      const updatedData = {
        quantity: newQuantity,
        totalValue: item.purchasePrice * newQuantity
      };
      
      const result = await updateInventoryItem(item.id, updatedData);
      
      toast.dismiss(loadingToastId);
      
      if (result.success) {
        showSuccessToast(`📦 Added ${addAmount} sq.ft to ${item.name}\nNew stock: ${newQuantity.toFixed(2)} sq.ft`);
      } else {
        showErrorToast(`❌ ${result.message}`);
      }
    } catch (error) {
      showErrorToast(`Error adding stock: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Show low stock warning on button click
  const handleLowStockClick = () => {
    setShowLowStock(!showLowStock);
    if (lowStockItems.length > 0 && !showLowStock) {
      showWarningToast(
        `⚠️ ${lowStockItems.length} items have low stock (<10 sq.ft)`,
        {
          autoClose: 5000,
        }
      );
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
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
        <div className="d-flex gap-2">
          <button 
            className="btn btn-primary" 
            onClick={() => {
              setShowForm(true);
              showInfoToast("Adding new inventory item...");
            }}
            disabled={loading}
          >
            <i className="bi bi-plus-circle me-2"></i>Add New Item
          </button>
          {lowStockItems.length > 0 && (
            <button 
              className="btn btn-warning" 
              onClick={handleLowStockClick}
              disabled={loading}
            >
              <i className="bi bi-exclamation-triangle me-2"></i>
              Low Stock ({lowStockItems.length})
            </button>
          )}
        </div>
      </div>
      
      {/* Add New Item Form */}
      {showForm && (
        <div className="card mb-4">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Add New Marble Item</h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => {
                setShowForm(false);
                showInfoToast("Add item cancelled");
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
                  <label className="form-label">Item Name <span className="text-danger">*</span></label>
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
                    showInfoToast("Add item cancelled");
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
      
      {/* Edit Item Form */}
      {showEditForm && editingItem && (
        <div className="card mb-4">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Edit Item: {editingItem.name}</h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => {
                setShowEditForm(false);
                setEditingItem(null);
                showInfoToast("Edit cancelled");
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
              }}
              disabled={loading}
            ></button>
          </div>
          <div className="card-body">
            <form onSubmit={handleUpdateSubmit}>
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
                  <label className="form-label">Item Name <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
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
                    disabled={loading}
                  />
                </div>
              </div>
              
              <div className="d-flex justify-content-end">
                <button 
                  type="button" 
                  className="btn btn-secondary me-2" 
                  onClick={() => {
                    setShowEditForm(false);
                    setEditingItem(null);
                    showInfoToast("Edit cancelled");
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
                      Updating...
                    </>
                  ) : 'Update Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Inventory List */}
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <div>
            <h5 className="mb-0">Inventory List</h5>
            <small className="text-muted">
              {showLowStock ? 'Low Stock Items' : `All Items (${filteredInventory.length})`}
            </small>
          </div>
          <div className="d-flex gap-2">
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-search"></i></span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by name, type, or supplier..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => showInfoToast("Type to search inventory...")}
                />
                {searchTerm && (
                  <button 
                    className="btn btn-outline-secondary"
                    onClick={() => {
                      setSearchTerm('');
                      showInfoToast("Search cleared");
                    }}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
            {showLowStock && (
              <button 
                className="btn btn-outline-secondary btn-sm"
                onClick={() => {
                  setShowLowStock(false);
                  showInfoToast("Showing all items");
                }}
                disabled={loading}
              >
                Show All
              </button>
            )}
          </div>
        </div>
        <div className="card-body">
          {filteredInventory.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-box-seam fs-1 text-muted mb-3"></i>
              <p className="text-muted">
                {showLowStock ? 'No low stock items' : 
                 searchTerm ? 'No inventory items found for your search' : 'No inventory items found'}
              </p>
              {searchTerm && !showLowStock && (
                <button 
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => {
                    setSearchTerm('');
                    showInfoToast("Search cleared");
                  }}
                >
                  Clear search
                </button>
              )}
              {showLowStock && (
                <button 
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => {
                    setShowLowStock(false);
                    showInfoToast("Showing all items");
                  }}
                >
                  Show All Items
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
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInventory.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <span className="badge bg-primary">{item.marbleType}</span>
                      </td>
                      <td>
                        <strong>{item.name}</strong>
                        {item.quantity < 10 && (
                          <div className="small text-danger">
                            <i className="bi bi-exclamation-triangle me-1"></i>
                            Low Stock
                          </div>
                        )}
                      </td>
                      <td>{item.width} × {item.height} {item.unit}</td>
                      <td>{parseFloat(item.sqft || 0).toFixed(2)}</td>
                      <td>{parseFloat(item.purchasePrice).toFixed(2)} PKR</td>
                      <td>
                        <span className={item.quantity < 10 ? 'text-danger fw-bold' : ''}>
                          {parseFloat(item.quantity).toFixed(2)} sq.ft
                        </span>
                      </td>
                      <td>{item.totalValue ? parseFloat(item.totalValue).toFixed(2) : '0.00'} PKR</td>
                      <td>{item.supplier || '-'}</td>
                      <td>{formatDate(item.entryDate)}</td>
                      <td>
                        {item.quantity < 5 ? (
                          <span className="badge bg-danger">
                            <i className="bi bi-exclamation-triangle me-1"></i>
                            Very Low
                          </span>
                        ) : item.quantity < 10 ? (
                          <span className="badge bg-warning">
                            <i className="bi bi-exclamation-triangle me-1"></i>
                            Low
                          </span>
                        ) : (
                          <span className="badge bg-success">
                            <i className="bi bi-check-circle me-1"></i>
                            In Stock
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm" role="group">
                          <button 
                            className="btn btn-outline-primary"
                            onClick={() => handleEditClick(item)}
                            disabled={loading}
                            title="Edit"
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button 
                            className="btn btn-outline-success"
                            onClick={() => handleQuickAddStock(item)}
                            disabled={loading}
                            title="Add Stock"
                          >
                            <i className="bi bi-plus-lg"></i>
                          </button>
                          <button 
                            className="btn btn-outline-danger"
                            onClick={() => handleDeleteClick(item)}
                            disabled={loading}
                            title="Delete"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          <div className="mt-3 text-muted small">
            <i className="bi bi-info-circle me-1"></i>
            Showing {filteredInventory.length} of {userInventory.length} items
            {lowStockItems.length > 0 && (
              <span className="ms-2">
                <i className="bi bi-exclamation-triangle text-warning me-1"></i>
                {lowStockItems.length} items have low stock (&lt;10 sq.ft)
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryManagement;