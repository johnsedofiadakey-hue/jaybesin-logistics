import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  writeBatch,
  query, 
  orderBy,
  setDoc,
  where,
  getDocs
} from 'firebase/firestore';
import { db } from '../firebase'; // Ensure this points to your firebase config file

/**
 * JAY-BESIN | SHIPMENT CONTEXT v7.3 (CONNECTION REPAIRED)
 * -------------------------------------------------------------------------
 * DEVELOPER: World Top Software Engineer
 * * ENGINEERING STATUS:
 * 1. PERSISTENCE: All changes are now pushed to Google Cloud Firestore.
 * 2. REAL-TIME: Listeners automatically update UI on all devices.
 * 3. NO COMPRESSION: Full, readable logic for future scaling.
 * -------------------------------------------------------------------------
 */

const ShipmentContext = createContext();

export const LOGISTICS_STAGES = [
  "Order Initiated",
  "Received at China Warehouse",
  "Quality Check & Consolidation",
  "Container Stuffing (Manifested)",
  "Vessel Departed Origin",
  "In Transit (High Seas)",
  "Arrived at TEMA Port",
  "Customs Clearance in Progress",
  "Duties Paid / Released",
  "Ready for Pickup / Delivery"
];

export const ShipmentProvider = ({ children }) => {
  // --- STATE REGISTRY ---
  const [shipments, setShipments] = useState([]);
  const [products, setProducts] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [messages, setMessages] = useState([]);
  const [agents, setAgents] = useState([]);
  const [settings, setSettings] = useState({
    siteName: "Jay-Besin Logistics",
    adminPass: "admin123",
    contactEmail: "info@jaybesin.com",
    currencyRate: "15.8" // Default fallback
  });
  const [loading, setLoading] = useState(true);

  // --- LIVE DATABASE LISTENERS (REAL-TIME SYNC) ---
  useEffect(() => {
    // 1. MANIFEST LISTENER (Shipments) - Ordered by Newest First
    const unsubManifest = onSnapshot(
      query(collection(db, "shipments"), orderBy("createdAt", "desc")), 
      (snapshot) => {
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setShipments(list);
        setLoading(false); // System is ready once shipments load
      },
      (error) => {
        console.error("Manifest Listener Error (Check Firebase Rules):", error);
        setLoading(false);
      }
    );

    // 2. INVENTORY LISTENER (Products)
    const unsubProducts = onSnapshot(collection(db, "products"), (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(list);
    });

    // 3. FLEET LISTENER (Vehicles)
    const unsubVehicles = onSnapshot(collection(db, "vehicles"), (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setVehicles(list);
    });

    // 4. CATEGORY LISTENER
    const unsubCategories = onSnapshot(collection(db, "categories"), (snapshot) => {
      const list = snapshot.docs.map(doc => doc.data().name);
      // If database is empty, provide default categories
      if (list.length > 0) {
        setCategories(list);
      } else {
        setCategories(["ELECTRONICS", "FASHION", "INDUSTRIAL", "HOME"]);
      }
    });

    // 5. SETTINGS LISTENER (Global Configuration)
    // Listens to a specific document 'global' in 'config' collection
    const unsubSettings = onSnapshot(doc(db, "config", "global"), (docSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        console.log("Settings Loaded from Cloud:", data); // Debug Log
        setSettings(prev => ({ ...prev, ...data }));
      } else {
        console.log("No Settings found in Cloud. Using defaults.");
      }
    });

    // 6. MESSAGES LISTENER
    const unsubMessages = onSnapshot(
      query(collection(db, "messages"), orderBy("createdAt", "desc")), 
      (snapshot) => {
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMessages(list);
      }
    );

    // 7. AGENTS LISTENER
    const unsubAgents = onSnapshot(collection(db, "agents"), (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAgents(list);
    });

    // Cleanup Listeners on Unmount (Prevent Memory Leaks)
    return () => {
      unsubManifest();
      unsubProducts();
      unsubVehicles();
      unsubCategories();
      unsubSettings();
      unsubMessages();
      unsubAgents();
    };
  }, []);

  // --- LOGISTICS METHODS (MANIFEST MANAGEMENT) ---
  const addShipment = async (data) => {
    try {
      await addDoc(collection(db, "shipments"), {
        ...data,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      });
    } catch (err) {
      console.error("Database Error (Add Shipment):", err);
      alert("Error saving shipment to cloud.");
    }
  };

  const updateShipment = async (id, updates) => {
    try {
      const docRef = doc(db, "shipments", id);
      await updateDoc(docRef, {
        ...updates,
        lastUpdated: new Date().toISOString()
      });
    } catch (err) {
      console.error("Database Error (Update Shipment):", err);
    }
  };

  const deleteShipment = async (id) => {
    if (window.confirm("CONFIRMATION: Permanently delete this shipment record from the cloud?")) {
      try {
        await deleteDoc(doc(db, "shipments", id));
      } catch (err) {
        console.error("Database Error (Delete Shipment):", err);
      }
    }
  };

  // --- BULK SYNC ENGINE (ATOMIC CLOUD UPDATE) ---
  const bulkUpdateShipments = async (ids, updates) => {
    try {
      const batch = writeBatch(db);
      ids.forEach(id => {
        const docRef = doc(db, "shipments", id);
        batch.update(docRef, {
          ...updates,
          lastUpdated: new Date().toISOString()
        });
      });
      await batch.commit(); 
      alert(`SYNC SUCCESSFUL: ${ids.length} Shipments updated in Cloud.`);
    } catch (err) {
      console.error("Database Error (Bulk Sync):", err);
      alert("Sync Failed. Check your network connection.");
    }
  };

  // --- SOURCING MART METHODS (INVENTORY) ---
  const addProduct = async (data) => {
    try {
      await addDoc(collection(db, "products"), {
        ...data,
        createdAt: new Date().toISOString()
      });
    } catch (err) {
      console.error("Database Error (Add Product):", err);
    }
  };

  const deleteProduct = async (id) => {
    if (window.confirm("Remove item from Global Inventory?")) {
      try {
        await deleteDoc(doc(db, "products", id));
      } catch (err) {
        console.error("Database Error (Delete Product):", err);
      }
    }
  };

  const addCategory = async (name) => {
    try {
      const formatted = name.trim().toUpperCase();
      // Check if exists first to avoid duplicates (Optional optimization)
      await addDoc(collection(db, "categories"), { name: formatted });
    } catch (err) {
      console.error("Database Error (Add Category):", err);
    }
  };

  const deleteCategory = async (name) => {
    try {
      // Query for the category by name since we store them as docs with a 'name' field
      const q = query(collection(db, "categories"), where("name", "==", name));
      const querySnapshot = await getDocs(q);
      
      const batch = writeBatch(db);
      querySnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
    } catch (err) {
      console.error("Database Error (Delete Category):", err);
    }
  };

  // --- AUTO STUDIO METHODS (FLEET) ---
  const addVehicle = async (data) => {
    try {
      await addDoc(collection(db, "vehicles"), {
        ...data,
        createdAt: new Date().toISOString()
      });
    } catch (err) {
      console.error("Database Error (Add Vehicle):", err);
    }
  };

  const updateVehicle = async (id, updates) => {
    try {
      const docRef = doc(db, "vehicles", id);
      await updateDoc(docRef, updates);
    } catch (err) {
      console.error("Database Error (Update Vehicle):", err);
    }
  };

  const deleteVehicle = async (id) => {
    if (window.confirm("Remove vehicle from Fleet Studio?")) {
      try {
        await deleteDoc(doc(db, "vehicles", id));
      } catch (err) {
        console.error("Database Error (Delete Vehicle):", err);
      }
    }
  };

  // --- GLOBAL SETTINGS SYNC (CLOUD PERSISTENCE) ---
  const setGlobalSettings = async (newSettings) => {
    try {
      const docRef = doc(db, "config", "global");
      // Merges new settings into the 'global' document without overwriting missing fields
      await setDoc(docRef, newSettings, { merge: true });
      console.log("Settings Pushed to Cloud Successfully.");
    } catch (err) {
      console.error("Database Error (Update Settings):", err);
      alert("Failed to save settings to cloud. Check Permissions.");
    }
  };

  // --- SIGNAL GRID METHODS (COMMUNICATION) ---
  const addMessage = async (msg) => {
    try {
      await addDoc(collection(db, "messages"), {
        ...msg,
        status: 'unread',
        createdAt: new Date().toISOString()
      });
    } catch (err) {
      console.error("Database Error (Add Message):", err);
    }
  };

  const addAgent = async (agent) => {
    try {
      await addDoc(collection(db, "agents"), {
        ...agent,
        status: "Pending",
        createdAt: new Date().toISOString()
      });
    } catch (err) {
      console.error("Database Error (Add Agent):", err);
    }
  };

  // --- HELPER: CALCULATE PROGRESS ---
  const calculateProgress = (status) => {
    if (!status) return 0;
    const index = LOGISTICS_STAGES.indexOf(status);
    if (index === -1) return 5;
    return Math.round(((index + 1) / LOGISTICS_STAGES.length) * 100);
  };

  // --- MASTER CONTEXT VALUE OBJECT ---
  const value = {
    shipments,
    addShipment,
    updateShipment,
    deleteShipment,
    bulkUpdateShipments,
    
    products,
    addProduct,
    deleteProduct,
    
    categories,
    addCategory,
    deleteCategory,
    
    vehicles,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    
    settings,
    setSettings: setGlobalSettings,
    
    messages,
    addMessage,
    
    agents,
    addAgent,
    
    loading,
    calculateProgress
  };

  return (
    <ShipmentContext.Provider value={value}>
      {children}
    </ShipmentContext.Provider>
  );
};

export const useShipments = () => {
  const context = useContext(ShipmentContext);
  if (!context) {
    throw new Error("SYSTEM ERROR: useShipments must be wrapped within ShipmentProvider.");
  }
  return context;
};