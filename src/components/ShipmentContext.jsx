import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  setDoc,
  getDoc 
} from "firebase/firestore";
import { db } from '../firebase'; // Import the connection we made

const ShipmentContext = createContext();

export const useShipments = () => useContext(ShipmentContext);

export const ShipmentProvider = ({ children }) => {
  // --- STATE HOLDERS ---
  const [shipments, setShipments] = useState([]);
  const [products, setProducts] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [settings, setLocalSettings] = useState({
    heroTitle: 'JAY-BESIN',
    contactPhone: '+233 55 306 5304',
    seaRate: 450,
    logo: null,
    nextLoadingDate: 'TBA'
  });
  const [loading, setLoading] = useState(true);

  // --- 1. REAL-TIME LISTENERS ( The Magic ) ---
  
  useEffect(() => {
    // A. Listen for SHIPMENTS updates
    const unsubShipments = onSnapshot(collection(db, "shipments"), (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort by newest date
      setShipments(list.sort((a,b) => new Date(b.dateReceived) - new Date(a.dateReceived)));
    });

    // B. Listen for PRODUCTS updates
    const unsubProducts = onSnapshot(collection(db, "products"), (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // C. Listen for VEHICLES updates
    const unsubVehicles = onSnapshot(collection(db, "vehicles"), (snapshot) => {
      setVehicles(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // D. Fetch Global SETTINGS (Single Document)
    const fetchSettings = async () => {
        const docRef = doc(db, "config", "globalSettings");
        // Listen to settings changes too
        onSnapshot(docRef, (doc) => {
            if (doc.exists()) {
                setLocalSettings(prev => ({ ...prev, ...doc.data() }));
            }
        });
    };
    fetchSettings();

    setLoading(false);

    // Cleanup listeners on unmount
    return () => {
      unsubShipments();
      unsubProducts();
      unsubVehicles();
    };
  }, []);

  // --- 2. ACTIONS (CRUD) ---

  // SHIPMENT ACTIONS
  const addShipment = async (data) => {
    try {
      await addDoc(collection(db, "shipments"), data);
    } catch (e) {
      console.error("Error adding shipment: ", e);
      alert("Error saving to cloud. Check internet connection.");
    }
  };

  const updateShipment = async (id, data) => {
    try {
      const ref = doc(db, "shipments", id);
      await updateDoc(ref, data);
    } catch (e) {
      console.error("Error updating: ", e);
    }
  };

  const deleteShipment = async (id) => {
    if(window.confirm("Permanently delete from database?")) {
        await deleteDoc(doc(db, "shipments", id));
    }
  };

  // PRODUCT ACTIONS
  const addProduct = async (data) => {
    await addDoc(collection(db, "products"), data);
  };
  const deleteProduct = async (id) => {
    await deleteDoc(doc(db, "products", id));
  };

  // VEHICLE ACTIONS
  const addVehicle = async (data) => {
    await addDoc(collection(db, "vehicles"), data);
  };
  const updateVehicle = async (id, data) => {
    await updateDoc(doc(db, "vehicles", id), data);
  };
  const deleteVehicle = async (id) => {
    await deleteDoc(doc(db, "vehicles", id));
  };

  // SETTINGS ACTIONS
  const updateSettings = async (newData) => {
    // Optimistic UI update
    setLocalSettings(newData);
    // Save to Cloud
    try {
        await setDoc(doc(db, "config", "globalSettings"), newData, { merge: true });
    } catch (e) {
        console.error("Settings save failed", e);
    }
  };

  // --- 3. EXPORT ---
  return (
    <ShipmentContext.Provider value={{
      loading,
      // Data
      shipments, products, vehicles, settings,
      // Functions
      addShipment, updateShipment, deleteShipment,
      addProduct, deleteProduct,
      addVehicle, updateVehicle, deleteVehicle,
      setSettings: updateSettings // We map setSettings to our cloud updater
    }}>
      {children}
    </ShipmentContext.Provider>
  );
};