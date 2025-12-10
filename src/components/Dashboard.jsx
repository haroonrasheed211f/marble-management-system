// components/Dashboard.jsx - FIXED
import React from 'react';

const Dashboard = ({ inventory, sales, customers, user }) => {
  // Add user filter to all calculations
  const userInventory = inventory.filter(item => item.userId === user.uid);
  const userSales = sales.filter(sale => sale.userId === user.uid);
  // Remove unused variable: const userCustomers = customers.filter(customer => customer.userId === user.uid);
  
  // Now calculate metrics using USER-SPECIFIC data
  const totalInventoryValue = userInventory.reduce((sum, item) => sum + (item.totalValue || 0), 0);
  const totalSqft = userInventory.reduce((sum, item) => sum + (item.quantity || 0), 0);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todaySales = userSales.filter(sale => {
    if (!sale.date) return false;
    try {
      const saleDate = sale.date.toDate ? sale.date.toDate() : new Date(sale.date);
      saleDate.setHours(0, 0, 0, 0);
      return saleDate.getTime() === today.getTime();
    } catch (error) {
      return false;
    }
  });
  
  const todaySalesTotal = todaySales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
  const todayProfit = todaySales.reduce((sum, sale) => sum + (sale.totalProfit || 0), 0);
  
  // Top selling marble types for THIS USER
  const salesByType = userSales.reduce((acc, sale) => {
    const type = sale.marbleType || 'Unknown';
    acc[type] = (acc[type] || 0) + (sale.quantity || 0);
    return acc;
  }, {});
  
  const topSellingTypes = Object.entries(salesByType)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  
  // Low stock alerts for THIS USER
  const lowStockItems = userInventory.filter(item => item.quantity < 10);
  
  // Recent sales for THIS USER
  const recentSales = [...userSales]
    .sort((a, b) => {
      const dateA = a.date ? (a.date.toDate ? a.date.toDate().getTime() : new Date(a.date).getTime()) : 0;
      const dateB = b.date ? (b.date.toDate ? b.date.toDate().getTime() : new Date(b.date).getTime()) : 0;
      return dateB - dateA;
    })
    .slice(0, 5);

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
        <h2>Dashboard Overview</h2>
        <div className="badge bg-info">
          <i className="bi bi-person me-1"></i>
          {user.name}'s Data
        </div>
      </div>
      
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card bg-primary text-white h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title">My Inventory Value</h6>
                  <h3 className="mb-0">{totalInventoryValue.toLocaleString()} PKR</h3>
                </div>
                <i className="bi bi-currency-exchange fs-1 opacity-50"></i>
              </div>
              <small className="opacity-75">{userInventory.length} items</small>
            </div>
          </div>
        </div>
        
        <div className="col-md-3 mb-3">
          <div className="card bg-success text-white h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title">My Available Sq.Ft</h6>
                  <h3 className="mb-0">{totalSqft.toLocaleString()} sq.ft</h3>
                </div>
                <i className="bi bi-box-seam fs-1 opacity-50"></i>
              </div>
              <small className="opacity-75">Across all items</small>
            </div>
          </div>
        </div>
        
        <div className="col-md-3 mb-3">
          <div className="card bg-info text-white h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title">Today's Sales</h6>
                  <h3 className="mb-0">{todaySalesTotal.toLocaleString()} PKR</h3>
                </div>
                <i className="bi bi-cart-check fs-1 opacity-50"></i>
              </div>
              <small className="opacity-75">{todaySales.length} sales today</small>
            </div>
          </div>
        </div>
        
        <div className="col-md-3 mb-3">
          <div className="card bg-warning text-white h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title">Today's Profit</h6>
                  <h3 className="mb-0">{todayProfit.toLocaleString()} PKR</h3>
                </div>
                <i className="bi bi-graph-up fs-1 opacity-50"></i>
              </div>
              <small className="opacity-75">Net profit</small>
            </div>
          </div>
        </div>
      </div>
      
      <div className="row">
        <div className="col-md-6 mb-4">
          <div className="card h-100">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">My Recent Sales</h5>
              <span className="badge bg-primary">{userSales.length} total</span>
            </div>
            <div className="card-body">
              {recentSales.length > 0 ? (
                recentSales.map((sale, index) => (
                  <div key={index} className="border-bottom pb-2 mb-2">
                    <div className="d-flex justify-content-between">
                      <div>
                        <strong>{sale.customerName || 'Unknown Customer'}</strong>
                        <small className="d-block text-muted">
                          {sale.marbleType || 'Unknown'} - {sale.quantity || 0} sq.ft
                        </small>
                        <small className="text-muted">{formatDate(sale.date)}</small>
                      </div>
                      <div className="text-end">
                        <span className="fw-bold">{(sale.totalAmount || 0).toLocaleString()} PKR</span>
                        <small className="d-block text-success">
                          Profit: {(sale.totalProfit || 0).toLocaleString()} PKR
                        </small>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted text-center">No sales recorded yet</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="col-md-6 mb-4">
          <div className="card h-100">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">My Top Selling Marble Types</h5>
              <i className="bi bi-trophy-fill text-warning"></i>
            </div>
            <div className="card-body">
              {topSellingTypes.length > 0 ? (
                topSellingTypes.map(([type, quantity], index) => {
                  const maxQuantity = Math.max(...Object.values(salesByType));
                  const percentage = maxQuantity > 0 ? (quantity / maxQuantity) * 100 : 0;
                  
                  return (
                    <div key={index} className="mb-3">
                      <div className="d-flex justify-content-between mb-1">
                        <span>{type}</span>
                        <span>{quantity} sq.ft</span>
                      </div>
                      <div className="progress" style={{ height: '8px' }}>
                        <div 
                          className="progress-bar" 
                          role="progressbar" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-muted text-center">No sales data available</p>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="row">
        <div className="col-md-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="bi bi-exclamation-triangle text-danger me-2"></i>
                My Low Stock Alerts
              </h5>
              <span className={`badge ${lowStockItems.length > 0 ? 'bg-danger' : 'bg-success'}`}>
                {lowStockItems.length} items
              </span>
            </div>
            <div className="card-body">
              {lowStockItems.length > 0 ? (
                <div className="row">
                  {lowStockItems.map((item, index) => (
                    <div key={index} className="col-md-4 mb-2">
                      <div className="alert alert-warning d-flex justify-content-between align-items-center">
                        <div>
                          <strong>{item.name}</strong>
                          <div className="small">{item.marbleType}</div>
                        </div>
                        <div className="text-end">
                          <span className="badge bg-danger">{item.quantity} sq.ft</span>
                          <div className="small">Remaining</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-success text-center">
                  <i className="bi bi-check-circle me-2"></i>
                  All my items have sufficient stock
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;