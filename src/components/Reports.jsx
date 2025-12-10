// components/Reports.jsx
import React, { useState } from 'react';

const Reports = ({ inventory, sales, customers }) => {
  const [activeReport, setActiveReport] = useState('inventory');
  const [dateRange, setDateRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  // Inventory Report Calculations
  const inventoryStats = {
    totalItems: inventory.length,
    totalSqft: inventory.reduce((sum, item) => sum + item.quantity, 0),
    totalValue: inventory.reduce((sum, item) => sum + item.totalValue, 0),
    lowStockItems: inventory.filter(item => item.quantity < 10).length,
    byType: inventory.reduce((acc, item) => {
      acc[item.marbleType] = (acc[item.marbleType] || 0) + item.quantity;
      return acc;
    }, {})
  };

  // Sales Report Calculations
  const filteredSales = sales.filter(sale => {
    const saleDate = new Date(sale.date).toISOString().split('T')[0];
    return saleDate >= dateRange.start && saleDate <= dateRange.end;
  });

  const salesStats = {
    totalSales: filteredSales.length,
    totalQuantity: filteredSales.reduce((sum, sale) => sum + sale.quantity, 0),
    totalAmount: filteredSales.reduce((sum, sale) => sum + sale.totalAmount, 0),
    totalProfit: filteredSales.reduce((sum, sale) => sum + sale.totalProfit, 0),
    byMarbleType: filteredSales.reduce((acc, sale) => {
      acc[sale.marbleType] = (acc[sale.marbleType] || 0) + sale.quantity;
      return acc;
    }, {}),
    byCustomer: filteredSales.reduce((acc, sale) => {
      acc[sale.customerName] = (acc[sale.customerName] || 0) + sale.quantity;
      return acc;
    }, {})
  };

  // Profit Report Calculations
  const profitStats = {
    avgProfitPerSqft: salesStats.totalQuantity > 0 
      ? salesStats.totalProfit / salesStats.totalQuantity 
      : 0,
    avgProfitPerSale: salesStats.totalSales > 0 
      ? salesStats.totalProfit / salesStats.totalSales 
      : 0,
    topProfitableItems: [...filteredSales]
      .sort((a, b) => b.totalProfit - a.totalProfit)
      .slice(0, 10)
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Reports</h2>
        <button className="btn btn-primary" onClick={handlePrintReport}>
          <i className="bi bi-printer me-2"></i>Print Report
        </button>
      </div>
      
      <div className="card">
        <div className="card-header">
          <ul className="nav nav-tabs card-header-tabs">
            <li className="nav-item">
              <button 
                className={`nav-link ${activeReport === 'inventory' ? 'active' : ''}`}
                onClick={() => setActiveReport('inventory')}
              >
                Inventory Report
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeReport === 'sales' ? 'active' : ''}`}
                onClick={() => setActiveReport('sales')}
              >
                Sales Report
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeReport === 'profit' ? 'active' : ''}`}
                onClick={() => setActiveReport('profit')}
              >
                Profit Report
              </button>
            </li>
          </ul>
        </div>
        
        <div className="card-body">
          {/* Date Range Selector for Sales & Profit Reports */}
          {(activeReport === 'sales' || activeReport === 'profit') && (
            <div className="row mb-4">
              <div className="col-md-6">
                <label className="form-label">Date Range</label>
                <div className="input-group">
                  <input
                    type="date"
                    className="form-control"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                  />
                  <span className="input-group-text">to</span>
                  <input
                    type="date"
                    className="form-control"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                  />
                </div>
              </div>
              <div className="col-md-6 d-flex align-items-end">
                <div className="alert alert-info mb-0 w-100">
                  <i className="bi bi-info-circle me-2"></i>
                  Showing data from {dateRange.start} to {dateRange.end}
                </div>
              </div>
            </div>
          )}
          
          {/* Inventory Report */}
          {activeReport === 'inventory' && (
            <div>
              <div className="row mb-4">
                <div className="col-md-3">
                  <div className="card bg-light">
                    <div className="card-body text-center">
                      <h6>Total Items</h6>
                      <h3>{inventoryStats.totalItems}</h3>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card bg-light">
                    <div className="card-body text-center">
                      <h6>Available Sq.Ft</h6>
                      <h3>{inventoryStats.totalSqft.toLocaleString()}</h3>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card bg-light">
                    <div className="card-body text-center">
                      <h6>Total Value</h6>
                      <h3>{inventoryStats.totalValue.toLocaleString()} PKR</h3>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card bg-light">
                    <div className="card-body text-center">
                      <h6>Low Stock Items</h6>
                      <h3 className={inventoryStats.lowStockItems > 0 ? 'text-danger' : ''}>
                        {inventoryStats.lowStockItems}
                      </h3>
                    </div>
                  </div>
                </div>
              </div>
              
              <h5>Inventory by Marble Type</h5>
              <div className="table-responsive mb-4">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Marble Type</th>
                      <th>Available Sq.Ft</th>
                      <th>Items Count</th>
                      <th>Value (PKR)</th>
                      <th>% of Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(inventoryStats.byType).map(([type, sqft]) => {
                      const typeItems = inventory.filter(item => item.marbleType === type);
                      const typeValue = typeItems.reduce((sum, item) => sum + item.totalValue, 0);
                      const percentage = (sqft / inventoryStats.totalSqft * 100).toFixed(1);
                      
                      return (
                        <tr key={type}>
                          <td>
                            <span className="badge bg-primary">{type}</span>
                          </td>
                          <td>{sqft.toLocaleString()} sq.ft</td>
                          <td>{typeItems.length}</td>
                          <td>{typeValue.toLocaleString()}</td>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="progress flex-grow-1 me-2" style={{ height: '8px' }}>
                                <div 
                                  className="progress-bar" 
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                              <span>{percentage}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              <h5>Low Stock Alerts</h5>
              {inventoryStats.lowStockItems > 0 ? (
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Item Name</th>
                        <th>Type</th>
                        <th>Available Sq.Ft</th>
                        <th>Purchase Price</th>
                        <th>Supplier</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inventory
                        .filter(item => item.quantity < 10)
                        .map((item, index) => (
                          <tr key={index}>
                            <td>{item.name}</td>
                            <td>{item.marbleType}</td>
                            <td className="text-danger fw-bold">{item.quantity} sq.ft</td>
                            <td>{item.purchasePrice} PKR</td>
                            <td>{item.supplier || '-'}</td>
                            <td>
                              <span className="badge bg-danger">Low Stock</span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="alert alert-success">
                  <i className="bi bi-check-circle me-2"></i>
                  All items have sufficient stock
                </div>
              )}
            </div>
          )}
          
          {/* Sales Report */}
          {activeReport === 'sales' && (
            <div>
              <div className="row mb-4">
                <div className="col-md-3">
                  <div className="card bg-light">
                    <div className="card-body text-center">
                      <h6>Total Sales</h6>
                      <h3>{salesStats.totalSales}</h3>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card bg-light">
                    <div className="card-body text-center">
                      <h6>Quantity Sold</h6>
                      <h3>{salesStats.totalQuantity.toLocaleString()} sq.ft</h3>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card bg-light">
                    <div className="card-body text-center">
                      <h6>Total Amount</h6>
                      <h3>{salesStats.totalAmount.toLocaleString()} PKR</h3>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card bg-light">
                    <div className="card-body text-center">
                      <h6>Total Profit</h6>
                      <h3 className="text-success">{salesStats.totalProfit.toLocaleString()} PKR</h3>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="row">
                <div className="col-md-6">
                  <h5>Sales by Marble Type</h5>
                  <div className="table-responsive mb-4">
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>Type</th>
                          <th>Quantity</th>
                          <th>% of Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(salesStats.byMarbleType)
                          .sort((a, b) => b[1] - a[1])
                          .map(([type, quantity]) => {
                            const percentage = (quantity / salesStats.totalQuantity * 100).toFixed(1);
                            return (
                              <tr key={type}>
                                <td>{type}</td>
                                <td>{quantity} sq.ft</td>
                                <td>
                                  <div className="d-flex align-items-center">
                                    <div className="progress flex-grow-1 me-2" style={{ height: '6px' }}>
                                      <div 
                                        className="progress-bar bg-success" 
                                        style={{ width: `${percentage}%` }}
                                      ></div>
                                    </div>
                                    <span>{percentage}%</span>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <div className="col-md-6">
                  <h5>Top Customers</h5>
                  <div className="table-responsive mb-4">
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>Customer</th>
                          <th>Quantity</th>
                          <th>Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(salesStats.byCustomer)
                          .sort((a, b) => b[1] - a[1])
                          .slice(0, 10)
                          .map(([customer, quantity]) => {
                            const customerSales = filteredSales.filter(s => s.customerName === customer);
                            const amount = customerSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
                            return (
                              <tr key={customer}>
                                <td>{customer}</td>
                                <td>{quantity} sq.ft</td>
                                <td>{amount.toLocaleString()} PKR</td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              
              <h5>Sales Details</h5>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Customer</th>
                      <th>Marble</th>
                      <th>Quantity</th>
                      <th>Rate</th>
                      <th>Amount</th>
                      <th>Profit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSales.map((sale, index) => (
                      <tr key={index}>
                        <td>{new Date(sale.date).toLocaleDateString()}</td>
                        <td>{sale.customerName}</td>
                        <td>{sale.itemName}</td>
                        <td>{sale.quantity} sq.ft</td>
                        <td>{sale.salePrice} PKR</td>
                        <td>{sale.totalAmount.toFixed(2)} PKR</td>
                        <td className="text-success">{sale.totalProfit.toFixed(2)} PKR</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {/* Profit Report */}
          {activeReport === 'profit' && (
            <div>
              <div className="row mb-4">
                <div className="col-md-4">
                  <div className="card bg-success text-white">
                    <div className="card-body text-center">
                      <h6>Total Profit</h6>
                      <h3>{salesStats.totalProfit.toLocaleString()} PKR</h3>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card bg-info text-white">
                    <div className="card-body text-center">
                      <h6>Avg. Profit per Sq.Ft</h6>
                      <h3>{profitStats.avgProfitPerSqft.toFixed(2)} PKR</h3>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card bg-warning text-white">
                    <div className="card-body text-center">
                      <h6>Avg. Profit per Sale</h6>
                      <h3>{profitStats.avgProfitPerSale.toFixed(2)} PKR</h3>
                    </div>
                  </div>
                </div>
              </div>
              
              <h5>Top Profitable Sales</h5>
              <div className="table-responsive mb-4">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Date</th>
                      <th>Customer</th>
                      <th>Marble</th>
                      <th>Quantity</th>
                      <th>Profit/sq.ft</th>
                      <th>Total Profit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profitStats.topProfitableItems.map((sale, index) => (
                      <tr key={index}>
                        <td>
                          <span className={`badge ${index < 3 ? 'bg-warning' : 'bg-secondary'}`}>
                            #{index + 1}
                          </span>
                        </td>
                        <td>{new Date(sale.date).toLocaleDateString()}</td>
                        <td>{sale.customerName}</td>
                        <td>{sale.itemName}</td>
                        <td>{sale.quantity} sq.ft</td>
                        <td>{sale.profitPerSqft.toFixed(2)} PKR</td>
                        <td className="text-success fw-bold">
                          {sale.totalProfit.toFixed(2)} PKR
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <h5>Profit by Marble Type</h5>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Marble Type</th>
                      <th>Sales Count</th>
                      <th>Quantity Sold</th>
                      <th>Total Amount</th>
                      <th>Total Profit</th>
                      <th>Avg. Profit/sq.ft</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(salesStats.byMarbleType).map(([type, quantity]) => {
                      const typeSales = filteredSales.filter(s => s.marbleType === type);
                      const amount = typeSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
                      const profit = typeSales.reduce((sum, sale) => sum + sale.totalProfit, 0);
                      const avgProfit = quantity > 0 ? profit / quantity : 0;
                      
                      return (
                        <tr key={type}>
                          <td>
                            <span className="badge bg-primary">{type}</span>
                          </td>
                          <td>{typeSales.length}</td>
                          <td>{quantity} sq.ft</td>
                          <td>{amount.toLocaleString()} PKR</td>
                          <td className="text-success">{profit.toLocaleString()} PKR</td>
                          <td>{avgProfit.toFixed(2)} PKR</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
        
        <div className="card-footer">
          <div className="d-flex justify-content-between align-items-center">
            <small className="text-muted">
              Report generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
            </small>
            <div>
              <button className="btn btn-sm btn-outline-primary me-2">
                <i className="bi bi-download me-1"></i>PDF
              </button>
              <button className="btn btn-sm btn-outline-secondary">
                <i className="bi bi-file-excel me-1"></i>Excel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;