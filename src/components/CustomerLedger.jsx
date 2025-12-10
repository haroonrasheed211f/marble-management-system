// components/CustomerLedger.jsx - FIXED VERSION
import React, { useState, useEffect } from 'react';

const CustomerLedger = ({ customers, sales, user }) => {
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [customerStats, setCustomerStats] = useState({
    totalPurchases: 0,
    totalAmount: 0,
    avgProfit: 0,
    totalProfit: 0
  });

  // FIX: Filter data by current user
  const userCustomers = customers.filter(customer => customer.userId === user.uid);
  const userSales = sales.filter(sale => sale.userId === user.uid);

  // FIX: Filter customers based on search
  const filteredCustomers = userCustomers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.includes(searchTerm)
  );

  // FIX: Get customer's sales properly
  const customerSales = selectedCustomer 
    ? userSales.filter(sale => 
        sale.customerName === selectedCustomer.name && 
        sale.customerPhone === selectedCustomer.phone
      )
    : [];

  // FIX: Calculate customer stats
  useEffect(() => {
    if (selectedCustomer && customerSales.length > 0) {
      const totalAmount = customerSales.reduce((sum, sale) => 
        sum + (parseFloat(sale.totalAmount) || 0), 0);
      
      const totalProfit = customerSales.reduce((sum, sale) => 
        sum + (parseFloat(sale.totalProfit) || 0), 0);
      
      setCustomerStats({
        totalPurchases: customerSales.length,
        totalAmount: totalAmount,
        totalProfit: totalProfit,
        avgProfit: customerSales.length > 0 ? totalProfit / customerSales.length : 0
      });
    } else {
      setCustomerStats({
        totalPurchases: 0,
        totalAmount: 0,
        avgProfit: 0,
        totalProfit: 0
      });
    }
  }, [selectedCustomer, customerSales]);

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

  const formatCurrency = (amount) => {
    return parseFloat(amount || 0).toFixed(2);
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Customer Ledger</h2>
        <div className="badge bg-info">
          <i className="bi bi-person me-1"></i>
          {user.name}'s Customers
        </div>
      </div>
      
      <div className="row">
        <div className="col-md-4">
          {/* Customers List */}
          <div className="card mb-4">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">My Customers</h5>
              <span className="badge bg-primary">{userCustomers.length}</span>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <div className="input-group">
                  <span className="input-group-text"><i className="bi bi-search"></i></span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by name or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="list-group" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {filteredCustomers.length === 0 ? (
                  <div className="text-center py-3">
                    <i className="bi bi-people fs-1 text-muted mb-2"></i>
                    <p className="text-muted">
                      {searchTerm ? 'No customers found' : 'No customers available'}
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
                  filteredCustomers.map(customer => {
                    // FIX: Calculate customer stats from sales
                    const customerTotalSales = userSales.filter(s => 
                      s.customerName === customer.name && s.customerPhone === customer.phone
                    );
                    const customerTotalAmount = customerTotalSales.reduce((sum, sale) => 
                      sum + (parseFloat(sale.totalAmount) || 0), 0);
                    
                    return (
                      <button
                        key={customer.id}
                        className={`list-group-item list-group-item-action ${selectedCustomer?.id === customer.id ? 'active' : ''}`}
                        onClick={() => setSelectedCustomer(customer)}
                      >
                        <div className="d-flex w-100 justify-content-between">
                          <h6 className="mb-1">{customer.name}</h6>
                          <small>
                            {customerTotalSales.length} {customerTotalSales.length === 1 ? 'purchase' : 'purchases'}
                          </small>
                        </div>
                        <small>
                          <i className="bi bi-telephone me-1"></i>
                          {customer.phone || 'No phone'}
                        </small>
                        <div className="small mt-1">
                          <span className="badge bg-success">
                            Total: {formatCurrency(customerTotalAmount)} PKR
                          </span>
                        </div>
                        <div className="small text-muted mt-1">
                          Last: {formatDate(customer.lastPurchase)}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>
          
          {/* Customer Profile */}
          {selectedCustomer && (
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Customer Profile</h5>
                <span className="badge bg-success">Active</span>
              </div>
              <div className="card-body">
                <h5>{selectedCustomer.name}</h5>
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
                      <div className="fs-4">{customerStats.totalPurchases}</div>
                      <small className="text-muted">Total Purchases</small>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="mb-2">
                      <div className="fs-4">{formatCurrency(customerStats.totalAmount)}</div>
                      <small className="text-muted">Total Spent (PKR)</small>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="mb-2">
                      <div className="fs-4 text-success">{formatCurrency(customerStats.totalProfit)}</div>
                      <small className="text-muted">Total Profit</small>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="mb-2">
                      <div className="fs-4">{formatCurrency(customerStats.avgProfit)}</div>
                      <small className="text-muted">Avg. Profit/Sale</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Purchase History */}
        <div className="col-md-8">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                {selectedCustomer ? `${selectedCustomer.name}'s Purchase History` : 'Select a customer'}
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
                              <th>Invoice #</th>
                              <th>Marble Details</th>
                              <th>Quantity</th>
                              <th>Rate</th>
                              <th>Total</th>
                              <th>Profit</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {customerSales.map((sale, index) => (
                              <tr key={index}>
                                <td>{formatDate(sale.date)}</td>
                                <td>
                                  <small className="text-muted">{sale.invoiceNumber || 'N/A'}</small>
                                </td>
                                <td>
                                  <div className="fw-bold">{sale.itemName}</div>
                                  <small className="text-muted">{sale.marbleType} - {sale.dimensions}</small>
                                </td>
                                <td>{parseFloat(sale.quantity).toFixed(2)} sq.ft</td>
                                <td>{parseFloat(sale.salePrice).toFixed(2)} PKR</td>
                                <td className="fw-bold">{formatCurrency(sale.totalAmount)} PKR</td>
                                <td>
                                  <span className={sale.totalProfit >= 0 ? 'text-success' : 'text-danger'}>
                                    {formatCurrency(sale.totalProfit)} PKR
                                  </span>
                                </td>
                                <td>
                                  <button 
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() => alert(`Invoice: ${sale.invoiceNumber}\nAmount: ${sale.totalAmount} PKR`)}
                                  >
                                    <i className="bi bi-eye"></i>
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr className="table-primary">
                              <td colSpan="4" className="text-end"><strong>Totals:</strong></td>
                              <td></td>
                              <td><strong>{formatCurrency(customerStats.totalAmount)} PKR</strong></td>
                              <td><strong className="text-success">{formatCurrency(customerStats.totalProfit)} PKR</strong></td>
                              <td></td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                      
                      {/* Summary Cards */}
                      <div className="mt-4">
                        <div className="row">
                          <div className="col-md-3 mb-3">
                            <div className="card bg-light">
                              <div className="card-body text-center">
                                <h6 className="text-muted">Total Purchases</h6>
                                <h3 className="text-primary">{customerStats.totalPurchases}</h3>
                              </div>
                            </div>
                          </div>
                          <div className="col-md-3 mb-3">
                            <div className="card bg-light">
                              <div className="card-body text-center">
                                <h6 className="text-muted">Total Amount</h6>
                                <h3 className="text-success">{formatCurrency(customerStats.totalAmount)}</h3>
                                <small>PKR</small>
                              </div>
                            </div>
                          </div>
                          <div className="col-md-3 mb-3">
                            <div className="card bg-light">
                              <div className="card-body text-center">
                                <h6 className="text-muted">Total Profit</h6>
                                <h3 className="text-success">{formatCurrency(customerStats.totalProfit)}</h3>
                                <small>PKR</small>
                              </div>
                            </div>
                          </div>
                          <div className="col-md-3 mb-3">
                            <div className="card bg-light">
                              <div className="card-body text-center">
                                <h6 className="text-muted">Avg. Profit/Sale</h6>
                                <h3 className="text-warning">{formatCurrency(customerStats.avgProfit)}</h3>
                                <small>PKR</small>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Customer Spending Chart (Simple) */}
                      <div className="mt-4">
                        <h6>Purchase Timeline</h6>
                        <div className="bg-light p-3 rounded">
                          {customerSales
                            .sort((a, b) => {
                              const dateA = a.date ? (a.date.toDate ? a.date.toDate() : new Date(a.date)) : new Date(0);
                              const dateB = b.date ? (b.date.toDate ? b.date.toDate() : new Date(b.date)) : new Date(0);
                              return dateB - dateA;
                            })
                            .slice(0, 10)
                            .map((sale, index) => {
                              const date = sale.date ? 
                                (sale.date.toDate ? sale.date.toDate() : new Date(sale.date)) : 
                                new Date();
                              const dateStr = date.toLocaleDateString('en-GB', { 
                                day: 'numeric', 
                                month: 'short' 
                              });
                              
                              return (
                                <div key={index} className="d-flex align-items-center mb-2">
                                  <div className="me-3" style={{ width: '80px' }}>
                                    <small className="text-muted">{dateStr}</small>
                                  </div>
                                  <div className="flex-grow-1">
                                    <div className="progress" style={{ height: '20px' }}>
                                      <div 
                                        className="progress-bar bg-success" 
                                        role="progressbar" 
                                        style={{ 
                                          width: `${Math.min((sale.totalAmount / customerStats.totalAmount) * 100, 100)}%` 
                                        }}
                                      >
                                        <small>{formatCurrency(sale.totalAmount)} PKR</small>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-5">
                      <i className="bi bi-cart-x fs-1 text-muted"></i>
                      <p className="text-muted">No purchase history found for this customer</p>
                      <p className="small text-muted">All sales will appear here automatically</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-5">
                  <i className="bi bi-person fs-1 text-muted"></i>
                  <p className="text-muted">Select a customer from the list to view their ledger</p>
                  <small className="text-muted">Showing only {user.name}'s customers</small>
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