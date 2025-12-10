// components/InvoiceGenerator.jsx
import React, { useState } from 'react';

const InvoiceGenerator = ({ sales, customers }) => {
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const generateInvoiceNumber = (saleId) => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `INV-${year}${month}${day}-${String(saleId).padStart(4, '0')}`;
  };

  const printInvoice = () => {
    const printWindow = window.open('', '_blank');
    const invoiceContent = document.getElementById('invoiceContent').innerHTML;
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${generateInvoiceNumber(selectedInvoice?.id || 0)}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          .invoice-header { border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 20px; }
          .company-name { font-size: 28px; font-weight: bold; color: #2c3e50; }
          .invoice-title { font-size: 24px; text-align: center; margin: 20px 0; }
          .invoice-details { margin: 20px 0; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { background-color: #f8f9fa; text-align: left; padding: 10px; border: 1px solid #dee2e6; }
          td { padding: 10px; border: 1px solid #dee2e6; }
          .total-row { font-weight: bold; background-color: #f8f9fa; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #000; }
          .text-end { text-align: right; }
          .text-center { text-align: center; }
        </style>
      </head>
      <body>
        ${invoiceContent}
        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
      </html>
    `);
  };

  return (
    <div>
      <h2 className="mb-4">Invoice Generator</h2>
      
      <div className="row">
        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Recent Sales</h5>
            </div>
            <div className="card-body">
              <div className="list-group">
                {sales.slice().reverse().map((sale, index) => (
                  <button
                    key={index}
                    className={`list-group-item list-group-item-action ${selectedInvoice?.id === sale.id ? 'active' : ''}`}
                    onClick={() => setSelectedInvoice(sale)}
                  >
                    <div className="d-flex w-100 justify-content-between">
                      <h6 className="mb-1">{sale.customerName}</h6>
                      <small>{formatDate(sale.date)}</small>
                    </div>
                    <p className="mb-1">{sale.itemName} - {sale.quantity} sq.ft</p>
                    <small>{sale.totalAmount.toFixed(2)} PKR</small>
                  </button>
                ))}
                
                {sales.length === 0 && (
                  <div className="text-center py-3">
                    <i className="bi bi-receipt fs-1 text-muted"></i>
                    <p className="text-muted">No sales recorded yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-8">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Invoice Preview</h5>
              {selectedInvoice && (
                <div>
                  <button className="btn btn-primary btn-sm me-2" onClick={printInvoice}>
                    <i className="bi bi-printer me-1"></i>Print
                  </button>
                  <button className="btn btn-success btn-sm">
                    <i className="bi bi-download me-1"></i>PDF
                  </button>
                </div>
              )}
            </div>
            <div className="card-body">
              {selectedInvoice ? (
                <div id="invoiceContent">
                  <div className="invoice-header">
                    <div className="row">
                      <div className="col-6">
                        <div className="company-name">Marble Masters</div>
                        <p className="mb-1">123 Stone Street, Marble City</p>
                        <p className="mb-1">Phone: (042) 123-4567</p>
                        <p className="mb-0">Email: info@marblemasters.com</p>
                      </div>
                      <div className="col-6 text-end">
                        <h4>INVOICE</h4>
                        <p className="mb-1">
                          <strong>Invoice #:</strong> {generateInvoiceNumber(selectedInvoice.id)}
                        </p>
                        <p className="mb-1">
                          <strong>Date:</strong> {formatDate(selectedInvoice.date)}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="invoice-details">
                    <div className="row mb-4">
                      <div className="col-6">
                        <h6>Bill To:</h6>
                        <p className="mb-1"><strong>{selectedInvoice.customerName}</strong></p>
                        <p className="mb-1">Phone: {selectedInvoice.customerPhone || 'N/A'}</p>
                      </div>
                      <div className="col-6 text-end">
                        <h6>Payment Details</h6>
                        <p className="mb-1"><strong>Status:</strong> Paid</p>
                        <p className="mb-1"><strong>Payment Method:</strong> Cash</p>
                      </div>
                    </div>
                    
                    <table className="table table-bordered">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Description</th>
                          <th>Dimensions</th>
                          <th>Quantity</th>
                          <th>Rate (sq.ft)</th>
                          <th>Amount (PKR)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>1</td>
                          <td>
                            <strong>{selectedInvoice.itemName}</strong><br />
                            <small>Type: {selectedInvoice.marbleType}</small>
                          </td>
                          <td>{selectedInvoice.dimensions}</td>
                          <td>{selectedInvoice.quantity} sq.ft</td>
                          <td>{selectedInvoice.salePrice} PKR</td>
                          <td>{selectedInvoice.totalAmount.toFixed(2)} PKR</td>
                        </tr>
                        {selectedInvoice.cementInfo && (
                          <tr>
                            <td>2</td>
                            <td colSpan="4">{selectedInvoice.cementInfo}</td>
                            <td>Included</td>
                          </tr>
                        )}
                      </tbody>
                      <tfoot>
                        <tr className="total-row">
                          <td colSpan="5" className="text-end"><strong>Total Amount:</strong></td>
                          <td><strong>{selectedInvoice.totalAmount.toFixed(2)} PKR</strong></td>
                        </tr>
                      </tfoot>
                    </table>
                    
                    <div className="row mt-4">
                      <div className="col-6">
                        <h6>Notes:</h6>
                        <p className="mb-0">{selectedInvoice.remarks || 'Thank you for your business!'}</p>
                      </div>
                      <div className="col-6">
                        <h6>Profit Summary:</h6>
                        <p className="mb-1">
                          Purchase Cost: {(selectedInvoice.quantity * selectedInvoice.purchasePrice).toFixed(2)} PKR
                        </p>
                        <p className="mb-0">
                          <strong>Net Profit: {selectedInvoice.totalProfit.toFixed(2)} PKR</strong>
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="footer">
                    <div className="row">
                      <div className="col-4 text-center">
                        <p className="mb-1">_______________________</p>
                        <p className="mb-0">Customer Signature</p>
                      </div>
                      <div className="col-4 text-center">
                        <p className="mb-1">_______________________</p>
                        <p className="mb-0">Sales Representative</p>
                      </div>
                      <div className="col-4 text-center">
                        <p className="mb-1">_______________________</p>
                        <p className="mb-0">Company Stamp</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-5">
                  <i className="bi bi-receipt fs-1 text-muted"></i>
                  <p className="text-muted">Select a sale from the list to generate an invoice</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceGenerator;