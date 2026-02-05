import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { app } from '../firebase'; // Assuming app is exported from firebase.js

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);

    const auth = getAuth(app);
    const db = getFirestore(app);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // Fetch user role from Firestore 'users' collection
                try {
                    const userDocRef = doc(db, 'users', user.uid);
                    const userDoc = await getDoc(userDocRef);

                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        setUserRole(userData.role || 'viewer'); // Default to viewer if no role
                        setCurrentUser({ ...user, ...userData });
                    } else {
                        // Fallback for users without profile doc
                        console.log("No user profile found, defaulting to viewer");
                        setUserRole('viewer');
                        setCurrentUser(user);
                    }
                } catch (error) {
                    console.error("Error fetching user role:", error);
                    setUserRole('viewer');
                    setCurrentUser(user);
                }
            } else {
                setCurrentUser(null);
                setUserRole(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, [auth, db]);

    const logout = () => {
        return signOut(auth);
    };

    const value = {
        currentUser,
        userRole,
        isAdmin: userRole === 'admin' || userRole === 'super_admin',
        isSuperAdmin: userRole === 'super_admin',
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
