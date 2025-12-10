// components/Navigation.jsx
import React from 'react';

const Navigation = ({ currentView, setCurrentView, user, onLogout }) => {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container-fluid">
        <a className="navbar-brand" href="#" onClick={() => setCurrentView('dashboard')}>
          <i className="bi bi-gem me-2"></i>
          Marble Inventory System
        </a>
        
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <a 
                className={`nav-link ${currentView === 'dashboard' ? 'active' : ''}`}
                href="#"
                onClick={() => setCurrentView('dashboard')}
              >
                <i className="bi bi-speedometer2 me-1"></i> Dashboard
              </a>
            </li>
            <li className="nav-item">
              <a 
                className={`nav-link ${currentView === 'inventory' ? 'active' : ''}`}
                href="#"
                onClick={() => setCurrentView('inventory')}
              >
                <i className="bi bi-box-seam me-1"></i> Inventory
              </a>
            </li>
            <li className="nav-item">
              <a 
                className={`nav-link ${currentView === 'sales' ? 'active' : ''}`}
                href="#"
                onClick={() => setCurrentView('sales')}
              >
                <i className="bi bi-cart me-1"></i> Sales
              </a>
            </li>
            <li className="nav-item">
              <a 
                className={`nav-link ${currentView === 'customers' ? 'active' : ''}`}
                href="#"
                onClick={() => setCurrentView('customers')}
              >
                <i className="bi bi-people me-1"></i> Customers
              </a>
            </li>
            <li className="nav-item">
              <a 
                className={`nav-link ${currentView === 'invoice' ? 'active' : ''}`}
                href="#"
                onClick={() => setCurrentView('invoice')}
              >
                <i className="bi bi-receipt me-1"></i> Invoices
              </a>
            </li>
            <li className="nav-item">
              <a 
                className={`nav-link ${currentView === 'reports' ? 'active' : ''}`}
                href="#"
                onClick={() => setCurrentView('reports')}
              >
                <i className="bi bi-bar-chart me-1"></i> Reports
              </a>
            </li>
          </ul>
          
          <div className="navbar-nav">
            <div className="nav-item me-3">
              <span className="nav-link text-light">
                <i className="bi bi-person-badge me-1"></i>
                {user?.name || 'Admin'} 
                <span className="badge bg-light text-dark ms-2">
                  {user?.role || 'Staff'}
                </span>
              </span>
            </div>
            <li className="nav-item">
              <button className="btn btn-outline-light btn-sm" onClick={onLogout}>
                <i className="bi bi-box-arrow-right me-1"></i> Logout
              </button>
            </li>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;