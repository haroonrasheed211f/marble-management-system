// components/SalesWorkflow.jsx
import React, { useState } from 'react';
import CustomerStep from './CustomerStep';
import InventoryStep from './InventoryStep';
import SaleDetailsStep from './SaleDetailsStep';
import CustomModal from '../common/CustomModal';

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
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Modal state
  const [modalConfig, setModalConfig] = useState({
    show: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: null,
    onCancel: null,
    showInput: false,
    defaultValue: ''
  });

  // Filter customers by current user
  const userCustomers = customers.filter(customer => customer.userId === user.uid);

  // Custom modal functions
  const showCustomModal = (title, message, type = 'info', onConfirm = null) => {
    setModalConfig({
      show: true,
      title,
      message,
      type,
      onConfirm,
      onCancel: () => setModalConfig(prev => ({ ...prev, show: false })),
      showInput: false,
      defaultValue: ''
    });
  };

  const showCustomPrompt = (title, message, defaultValue = '') => {
    return new Promise((resolve) => {
      setModalConfig({
        show: true,
        title,
        message,
        type: 'prompt',
        onConfirm: (value) => {
          setModalConfig(prev => ({ ...prev, show: false }));
          resolve(value || defaultValue);
        },
        onCancel: () => {
          setModalConfig(prev => ({ ...prev, show: false }));
          resolve('');
        },
        showInput: true,
        defaultValue
      });
    });
  };

  const showCustomConfirm = (title, message) => {
    return new Promise((resolve) => {
      setModalConfig({
        show: true,
        title,
        message,
        type: 'confirm',
        onConfirm: () => {
          setModalConfig(prev => ({ ...prev, show: false }));
          resolve(true);
        },
        onCancel: () => {
          setModalConfig(prev => ({ ...prev, show: false }));
          resolve(false);
        },
        showInput: false
      });
    });
  };

  // Handle customer selection and move to step 2
  const handleCustomerSelect = (customerData) => {
    setSaleData(prev => ({
      ...prev,
      customerName: customerData.customerName,
      customerPhone: customerData.customerPhone
    }));
    setStep(2);
  };

  // Handle item selection and move to step 3
  const handleItemSelect = (item) => {
    setSelectedItem(item);
    const suggestedPrice = (item.purchasePrice * 1.2).toFixed(2);
    setSaleData(prev => ({
      ...prev,
      salePrice: suggestedPrice
    }));
    setStep(3);
  };

  const handleSaleDataChange = (e) => {
    const { name, value } = e.target;
    setSaleData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCompleteSale = async () => {
    // Validation
    if (!selectedItem || !saleData.quantity || !saleData.salePrice || !saleData.customerName) {
      setMessage({ 
        type: 'error', 
        text: '❌ Please fill all required fields:\n- Customer Name\n- Quantity\n- Sale Price' 
      });
      return;
    }

    // Validate stock
    const requestedQty = parseFloat(saleData.quantity) || 0;
    const availableQty = parseFloat(selectedItem.quantity) || 0;
    if (requestedQty > availableQty) {
      setMessage({ 
        type: 'error', 
        text: `❌ Stock not available!\nRequested: ${requestedQty} sq.ft\nAvailable: ${availableQty} sq.ft` 
      });
      return;
    }

    try {
      setLoading(true);
      setMessage({ type: '', text: '' });
      
      // Calculate profit
      const quantity = parseFloat(saleData.quantity);
      const salePrice = parseFloat(saleData.salePrice);
      const purchasePrice = parseFloat(selectedItem.purchasePrice);
      const profitPerSqft = salePrice - purchasePrice;
      const totalProfit = profitPerSqft * quantity;
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
        profitPerSqft: profitPerSqft,
        totalProfit: totalProfit,
        totalAmount: totalAmount,
        remarks: saleData.remarks,
        cementInfo: saleData.cementInfo
      };

      const result = await addSale(saleRecord);
      
      if (result.success) {
        setMessage({ 
          type: 'success', 
          text: `✅ Sale completed successfully!\nInvoice generated.\nProfit: ${totalProfit.toFixed(2)} PKR` 
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
                  Select Customer
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link ${step === 2 ? 'active' : ''} ${step > 2 ? 'text-success' : ''}`}
                  onClick={() => saleData.customerName && setStep(2)}
                  disabled={!saleData.customerName || loading}
                >
                  <span className={`badge bg-${step === 2 ? 'light text-dark' : step > 2 ? 'success' : 'secondary'} me-2`}>
                    2
                  </span>
                  Search Inventory
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link ${step === 3 ? 'active' : ''}`}
                  onClick={() => {
                    if (selectedItem && saleData.quantity && saleData.salePrice && saleData.customerName) {
                      setStep(3);
                    }
                  }}
                  disabled={!selectedItem || !saleData.quantity || !saleData.salePrice || !saleData.customerName || loading}
                >
                  <span className={`badge bg-${step === 3 ? 'light text-dark' : 'secondary'} me-2`}>
                    3
                  </span>
                  Sale Details
                </button>
              </li>
            </ul>
          </div>
          
          <div className="card-body">
            {step === 1 && (
              <CustomerStep
                userCustomers={userCustomers}
                saleData={saleData}
                setSaleData={setSaleData}
                loading={loading}
                setLoading={setLoading}
                setMessage={setMessage}
                addCustomer={addCustomer}
                showCustomPrompt={showCustomPrompt}
                showCustomConfirm={showCustomConfirm}
                onCustomerSelect={handleCustomerSelect}
              />
            )}
            
            {step === 2 && (
              <InventoryStep
                inventory={inventory}
                user={user}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                selectedItem={selectedItem}
                loading={loading}
                onSelectItem={handleItemSelect}
                onBack={() => setStep(1)}
              />
            )}
            
            {step === 3 && selectedItem && (
              <SaleDetailsStep
                selectedItem={selectedItem}
                saleData={saleData}
                handleSaleDataChange={handleSaleDataChange}
                loading={loading}
                setStep={setStep}
                onCompleteSale={handleCompleteSale}
                setMessage={setMessage}
              />
            )}
          </div>
        </div>
      </div>
      
      <CustomModal
        config={modalConfig}
        setConfig={setModalConfig}
      />
    </>
  );
};

export default SalesWorkflow;