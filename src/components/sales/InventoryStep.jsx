// components/InventoryStep.jsx
import React from 'react';

const InventoryStep = ({
  inventory,
  user,
  searchTerm,
  setSearchTerm,
  selectedItem,
  loading,
  onSelectItem,
  onBack
}) => {
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

  return (
    <div>
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h5>Search Available Marble Stock</h5>
            <p className="text-muted">
              Search by marble name, type, or dimensions (e.g., "20*60", "Black Galaxy", "Granite")
            </p>
          </div>
          <button 
            className="btn btn-outline-secondary"
            onClick={onBack}
            disabled={loading}
          >
            <i className="bi bi-arrow-left me-1"></i>
            Back to Customers
          </button>
        </div>
        
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
              <div className={`card h-100 ${selectedItem?.id === item.id ? 'border-primary border-2' : ''}`}>
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
                        className={`btn btn-sm ${selectedItem?.id === item.id ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => onSelectItem(item)}
                        disabled={loading}
                      >
                        {selectedItem?.id === item.id ? (
                          <>
                            <i className="bi bi-check-circle me-1"></i>
                            Selected
                          </>
                        ) : (
                          <>
                            <i className="bi bi-cart-plus me-1"></i>
                            Select
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      {selectedItem && (
        <div className="mt-4 pt-3 border-top">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h6>Selected Item:</h6>
              <p className="mb-0">
                <strong>{selectedItem.name}</strong> ({selectedItem.marbleType}) - 
                {selectedItem.width}×{selectedItem.height} {selectedItem.unit}
              </p>
            </div>
            <button 
              className="btn btn-primary"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              Continue to Sale Details 
              <i className="bi bi-arrow-right ms-2"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryStep;