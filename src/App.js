// src/App.js
import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import InventoryManagement from './components/InventoryManagement';
import SalesWorkflow from './components/SalesWorkflow';
import CustomerLedger from './components/CustomerLedger';
import InvoiceGenerator from './components/InvoiceGenerator';
import Reports from './components/Reports';
import LoginSignup from './components/LoginSignup';
import { auth, db } from './firebase';
import { 
  onAuthStateChanged, 
  signOut 
} from 'firebase/auth';
import { 
  collection, 
  query, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  serverTimestamp,
  where,
  getDocs,
  getDoc
} from 'firebase/firestore';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [sales, setSales] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Listen to authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("Auth State Changed:", firebaseUser);
      
      if (firebaseUser) {
        try {
          // Get user role from Firestore
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          let userRole = 'staff';
          
          if (userDoc.exists()) {
            userRole = userDoc.data().role || 'staff';
          } else {
            // Create user document if doesn't exist
            await addDoc(collection(db, 'users'), {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
              role: 'admin', // First user gets admin
              createdAt: serverTimestamp(),
              lastLogin: serverTimestamp()
            });
            userRole = 'admin';
          }
          
          setIsAuthenticated(true);
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
            role: userRole
          });
          
          // Update last login
          await updateDoc(userDocRef, {
            lastLogin: serverTimestamp()
          });
          
          // Load all data
          await loadFirestoreData();
        } catch (error) {
          console.error("Error in auth state change:", error);
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
        setInventory([]);
        setSales([]);
        setCustomers([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loadFirestoreData = async () => {
    try {
      setLoading(true);
      
      // Load inventory
      const inventoryQuery = query(collection(db, 'inventory'));
      const inventorySnapshot = await getDocs(inventoryQuery);
      const inventoryData = inventorySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setInventory(inventoryData);
      
      // Load sales
      const salesQuery = query(collection(db, 'sales'));
      const salesSnapshot = await getDocs(salesQuery);
      const salesData = salesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSales(salesData);
      
      // Load customers
      const customersQuery = query(collection(db, 'customers'));
      const customersSnapshot = await getDocs(customersQuery);
      const customersData = customersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCustomers(customersData);
      
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Error loading data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setCurrentView('dashboard');
      alert('Logged out successfully!');
    } catch (error) {
      console.error('Logout error:', error);
      alert('Logout failed: ' + error.message);
    }
  };

  const addInventoryItem = async (item) => {
    try {
      console.log("Adding inventory item:", item);
      console.log("Current user:", user);
      
      if (!user || !user.uid) {
        throw new Error("User not authenticated");
      }
      
      const totalValue = item.purchasePrice * item.quantity;
      
      const itemData = {
        marbleType: item.marbleType,
        name: item.name,
        width: item.width,
        height: item.height,
        unit: item.unit,
        sqft: item.sqft,
        purchasePrice: item.purchasePrice,
        quantity: item.quantity,
        totalValue: totalValue,
        supplier: item.supplier || '',
        entryDate: new Date().toISOString(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        userId: user.uid
      };
      
      console.log("Item data for Firestore:", itemData);
      
      const docRef = await addDoc(collection(db, 'inventory'), itemData);
      console.log("Document written with ID:", docRef.id);
      
      // Refresh data
      await loadFirestoreData();
      
      return { success: true, message: 'Inventory item added successfully!' };
    } catch (error) {
      console.error('Error adding inventory:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      let errorMessage = 'Failed to add item: ' + error.message;
      
      if (error.code === 'permission-denied') {
        errorMessage = 'Permission denied. Please check Firestore security rules.';
      }
      
      return { success: false, message: errorMessage };
    }
  };

  const addSale = async (sale) => {
    try {
      // Generate invoice number
      const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Add sale to Firestore
      await addDoc(collection(db, 'sales'), {
        inventoryId: sale.inventoryId,
        customerName: sale.customerName,
        customerPhone: sale.customerPhone || '',
        marbleType: sale.marbleType,
        itemName: sale.itemName,
        dimensions: sale.dimensions,
        quantity: sale.quantity,
        purchasePrice: sale.purchasePrice,
        salePrice: sale.salePrice,
        profitPerSqft: sale.profitPerSqft,
        totalProfit: sale.totalProfit,
        totalAmount: sale.totalAmount,
        remarks: sale.remarks || '',
        cementInfo: sale.cementInfo || '',
        invoiceNumber: invoiceNumber,
        userId: user.uid,
        date: serverTimestamp(),
        createdAt: serverTimestamp()
      });

      // Update inventory quantity
      const inventoryItem = inventory.find(item => item.id === sale.inventoryId);
      if (inventoryItem) {
        const newQuantity = inventoryItem.quantity - sale.quantity;
        const inventoryRef = doc(db, 'inventory', sale.inventoryId);
        await updateDoc(inventoryRef, {
          quantity: newQuantity,
          updatedAt: serverTimestamp()
        });
      }

      // Update or create customer
      await updateCustomerAfterSale(sale.customerName, sale.customerPhone, sale.totalAmount);

      // Refresh all data
      await loadFirestoreData();
      
      return { success: true, message: 'Sale completed successfully!' };
    } catch (error) {
      console.error('Error adding sale:', error);
      return { success: false, message: 'Failed to complete sale: ' + error.message };
    }
  };

  const updateCustomerAfterSale = async (customerName, customerPhone, amount) => {
    try {
      if (!customerPhone) return;
      
      // Check if customer exists by phone
      const customersQuery = query(
        collection(db, 'customers'),
        where('phone', '==', customerPhone)
      );
      const querySnapshot = await getDocs(customersQuery);
      
      if (!querySnapshot.empty) {
        // Update existing customer
        const customerDoc = querySnapshot.docs[0];
        const customerData = customerDoc.data();
        
        await updateDoc(doc(db, 'customers', customerDoc.id), {
          totalPurchases: (customerData.totalPurchases || 0) + 1,
          totalAmount: (customerData.totalAmount || 0) + amount,
          lastPurchase: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      } else {
        // Create new customer
        await addDoc(collection(db, 'customers'), {
          name: customerName,
          phone: customerPhone,
          totalPurchases: 1,
          totalAmount: amount,
          lastPurchase: serverTimestamp(),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error updating customer:', error);
    }
  };

  const addCustomer = async (customer) => {
    try {
      await addDoc(collection(db, 'customers'), {
        name: customer.name,
        phone: customer.phone || '',
        address: customer.address || '',
        totalPurchases: 0,
        totalAmount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      // Refresh customers data
      await loadFirestoreData();
      
      return { success: true, message: 'Customer added successfully!' };
    } catch (error) {
      console.error('Error adding customer:', error);
      return { success: false, message: 'Failed to add customer: ' + error.message };
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="text-center">
          <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 fs-5">Loading Marble Management System...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - show login
  if (!isAuthenticated) {
    return <LoginSignup onLogin={loadFirestoreData} />;
  }

  // Main app
  return (
    <div className="App">
      <Navigation 
        currentView={currentView}
        setCurrentView={setCurrentView}
        user={user}
        onLogout={handleLogout}
      />
      
      <div className="container-fluid mt-4">
        {currentView === 'dashboard' && (
          <Dashboard 
            inventory={inventory}
            sales={sales}
            customers={customers}
          />
        )}
        
        {currentView === 'inventory' && (
          <InventoryManagement 
            inventory={inventory}
            addInventoryItem={addInventoryItem}
            user={user}
          />
        )}
        
        {currentView === 'sales' && (
          <SalesWorkflow 
            inventory={inventory}
            addSale={addSale}
            customers={customers}
            addCustomer={addCustomer}
            user={user}
          />
        )}
        
        {currentView === 'customers' && (
          <CustomerLedger 
            customers={customers}
            sales={sales}
          />
        )}
        
        {currentView === 'invoice' && (
          <InvoiceGenerator 
            sales={sales}
            customers={customers}
          />
        )}
        
        {currentView === 'reports' && (
          <Reports 
            inventory={inventory}
            sales={sales}
            customers={customers}
          />
        )}
      </div>
    </div>
  );
}

export default App;