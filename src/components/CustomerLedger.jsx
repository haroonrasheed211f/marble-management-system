// components/CustomerLedger.jsx
import React, { useState } from 'react';

const CustomerLedger = ({ customers, sales }) => {
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const customerSales = selectedCustomer 
    ? sales.filter(sale => sale.customerName === selectedCustomer.name)
    : [];

  const calculateCustomerStats = () => {
    if (!selectedCustomer || customerSales.length === 0) {
      return { totalPurchases: 0, totalAmount: 0, avgProfit: 0, totalProfit: 0 };
    }

    const totalAmount = customerSales.reduce((sum, sale) => 
      sum + sale.totalAmount, 0);
    
    const totalProfit = customerSales.reduce((sum, sale) => 
      sum + sale.totalProfit, 0);
    
    return {
      totalPurchases: customerSales.length,
      totalAmount,
      totalProfit,
      avgProfit: totalProfit / customerSales.length
    };
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  };

  const stats = calculateCustomerStats();

  return (
    <div>
      <h2 className="mb-4">Customer Ledger</h2>
      
      <div className="row">
        <div className="col-md-4">
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">Customer List</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="list-group" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {filteredCustomers.length === 0 ? (
                  <div className="text-center py-3">
                    <i className="bi bi-people fs-1 text-muted mb-2"></i>
                    <p className="text-muted">No customers found</p>
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
                  filteredCustomers.map(customer => (
                    <button
                      key={customer.id}
                      className={`list-group-item list-group-item-action ${selectedCustomer?.id === customer.id ? 'active' : ''}`}
                      onClick={() => setSelectedCustomer(customer)}
                    >
                      <div className="d-flex w-100 justify-content-between">
                        <h6 className="mb-1">{customer.name}</h6>
                        <small>{sales.filter(s => s.customerName === customer.name).length} purchases</small>
                      </div>
                      <small>{customer.phone}</small>
                      <div className="small text-muted mt-1">
                        Total: {customer.totalAmount ? customer.totalAmount.toLocaleString() : 0} PKR
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
          
          {selectedCustomer && (
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Customer Profile</h5>
              </div>
              <div className="card-body">
                <h6>{selectedCustomer.name}</h6>
                <p className="mb-1">
                  <i className="bi bi-telephone me-2"></i>
                  {selectedCustomer.phone || 'Not provided'}
                </p>
                <p className="mb-1">
                  <i className="bi bi-geo-alt me-2"></i>
                  {selectedCustomer.address || 'Not provided'}
                </p>
                <p className="mb-0">
                  <i className="bi bi-calendar me-2"></i>
                  Last Purchase: {formatDate(selectedCustomer.lastPurchase)}
                </p>
                
                <hr />
                
                <div className="row text-center">
                  <div className="col-6">
                    <div className="mb-2">
                      <div className="fs-4">{stats.totalPurchases}</div>
                      <small className="text-muted">Total Purchases</small>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="mb-2">
                      <div className="fs-4">{stats.totalAmount.toLocaleString()} PKR</div>
                      <small className="text-muted">Total Spent</small>
                    </div>
                  </div>
                </div>
                
                <div className="d-grid gap-2 mt-3">
                  <button className="btn btn-outline-primary">
                    <i className="bi bi-printer me-2"></i>Print Ledger
                  </button>
                  <button className="btn btn-outline-secondary">
                    <i className="bi bi-download me-2"></i>Download PDF
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="col-md-8">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                {selectedCustomer ? `${selectedCustomer.name}'s Purchase History` : 'Select a customer to view ledger'}
              </h5>
              {selectedCustomer && (
                <span className="badge bg-primary">
                  {customerSales.length} transactions
                </span>
              )}
            </div>
            <div className="card-body">
              {selectedCustomer ? (
                <div>
                  {customerSales.length > 0 ? (
                    <>
                      <div className="table-responsive">
                        <table className="table table-hover">
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th>Marble</th>
                              <th>Quantity</th>
                              <th>Rate</th>
                              <th>Total</th>
                              <th>Profit</th>
                              <th>Invoice</th>
                            </tr>
                          </thead>
                          <tbody>
                            {customerSales.map((sale, index) => (
                              <tr key={index}>
                                <td>{formatDate(sale.date)}</td>
                                <td>
                                  <div>{sale.itemName}</div>
                                  <small className="text-muted">{sale.marbleType}</small>
                                </td>
                                <td>{sale.quantity} sq.ft</td>
                                <td>{sale.salePrice} PKR/sq.ft</td>
                                <td>{sale.totalAmount.toFixed(2)} PKR</td>
                                <td>
                                  <span className={sale.totalProfit >= 0 ? 'text-success' : 'text-danger'}>
                                    {sale.totalProfit.toFixed(2)} PKR
                                  </span>
                                </td>
                                <td>
                                  <button className="btn btn-sm btn-outline-primary">
                                    <i className="bi bi-receipt"></i>
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      
                      <div className="mt-4">
                        <div className="row">
                          <div className="col-md-3">
                            <div className="card bg-light">
                              <div className="card-body text-center">
                                <h6>Total Purchases</h6>
                                <h4>{customerSales.length}</h4>
                              </div>
                            </div>
                          </div>
                          <div className="col-md-3">
                            <div className="card bg-light">
                              <div className="card-body text-center">
                                <h6>Total Amount</h6>
                                <h4>{stats.totalAmount.toLocaleString()} PKR</h4>
                              </div>
                            </div>
                          </div>
                          <div className="col-md-3">
                            <div className="card bg-light">
                              <div className="card-body text-center">
                                <h6>Total Profit</h6>
                                <h4 className="text-success">{stats.totalProfit.toLocaleString()} PKR</h4>
                              </div>
                            </div>
                          </div>
                          <div className="col-md-3">
                            <div className="card bg-light">
                              <div className="card-body text-center">
                                <h6>Avg. Profit</h6>
                                <h4 className={stats.avgProfit >= 0 ? 'text-success' : 'text-danger'}>
                                  {stats.avgProfit.toFixed(2)} PKR
                                </h4>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-5">
                      <i className="bi bi-cart-x fs-1 text-muted"></i>
                      <p className="text-muted">No purchase history found for this customer</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-5">
                  <i className="bi bi-person fs-1 text-muted"></i>
                  <p className="text-muted">Select a customer from the list to view their ledger</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerLedger;