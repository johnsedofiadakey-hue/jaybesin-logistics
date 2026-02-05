import React, { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth'; // Note: Client-side creation caveats apply
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { UserPlus, Shield, Check, AlertCircle } from 'lucide-react';
import { app } from '../../firebase'; // Import app to ensure consistent instance

const ManageUsers = () => {
    const { isSuperAdmin } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('admin');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [isError, setIsError] = useState(false);

    if (!isSuperAdmin) {
        return (
            <div className="p-8 text-center bg-red-50 rounded-xl border border-red-100">
                <Shield className="mx-auto text-red-400 mb-2" size={32} />
                <h3 className="text-red-800 font-bold uppercase">Restricted Access</h3>
                <p className="text-xs text-red-600">Super Admin privileges required to manage personnel.</p>
            </div>
        );
    }

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setIsError(false);

        const auth = getAuth(app);
        const db = getFirestore(app);

        try {
            // WARNING: Creating a user with client SDK logs them in immediately, 
            // replacing the current session. This is a limitation of the client SDK.
            // In a real production app, use a Callable Cloud Function.
            // For this implementation, we will warn the user or use a 'secondary' app approach 
            // if we wanted to be fancy, but simple is better here for auditing.

            // To avoid logging out the admin, we can't easily use createUserWithEmailAndPassword 
            // on the MAIN auth instance.
            // A common workaround without Cloud Functions is to create a temporary separate app instance.

            /* 
               Better Approach: Just store the request in a 'invites' collection 
               and have the user sign up themselves, or use Cloud Functions.
               
               For NOW: We will implementation a "Simulation" that writes to Firestore 
               so the user can just manually create the Auth user in Firebase Console 
               but the Role is set here. Or we accept the logout.
            */

            // Let's try the secondary app approach to avoid logout
            // This is a known pattern for client-side admin tools
            const { initializeApp } = await import("firebase/app");
            const { getAuth: getAuthSecondary, createUserWithEmailAndPassword: createSecondary } = await import("firebase/auth");

            // Re-use config but new name
            const config = auth.app.options;
            const secondaryApp = initializeApp(config, "SecondaryApp");
            const secondaryAuth = getAuthSecondary(secondaryApp);

            const userCredential = await createSecondary(secondaryAuth, email, password);
            const newUser = userCredential.user;

            // Now write the role to the MAIN firestore
            await setDoc(doc(db, 'users', newUser.uid), {
                email: email,
                role: role,
                createdAt: serverTimestamp(),
                createdBy: auth.currentUser.uid
            });

            // Cleanup
            await secondaryAuth.signOut(); // Sign out of secondary
            // secondaryApp.delete(); // Delete if supported by SDK version, or just leave it

            setMessage(`User ${email} created successfully as ${role.toUpperCase()}.`);
            setEmail('');
            setPassword('');
        } catch (error) {
            console.error("Creation Error:", error);
            setIsError(true);
            setMessage('Operation Failed: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm animate-in fade-in">
            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                <div className="bg-blue-50 text-blue-600 p-2 rounded-lg"><UserPlus size={20} /></div>
                <div>
                    <h3 className="font-bold text-slate-900 text-lg uppercase tracking-tight">Onboard Personnel</h3>
                    <p className="text-xs text-slate-500">Grant terminal access to new operators.</p>
                </div>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 max-w-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-500 uppercase">Email Identity</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold outline-none focus:border-blue-500 transition-all"
                            placeholder="agent@jaybesin.com"
                            required
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-500 uppercase">Role Assignment</label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold outline-none focus:border-blue-500 transition-all"
                        >
                            <option value="admin">Admin (Full Access)</option>
                            <option value="editor">Editor (Logistics Only)</option>
                            <option value="viewer">Viewer (Read Only)</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase">Secure Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold outline-none focus:border-blue-500 transition-all"
                        placeholder="••••••••"
                        required
                        minLength={6}
                    />
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full md:w-auto px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-600 shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
                    >
                        {loading ? 'Processing...' : 'Generate Access Key'}
                    </button>
                </div>
            </form>

            {message && (
                <div className={`mt-6 p-4 rounded-xl flex items-center gap-3 ${isError ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'}`}>
                    {isError ? <AlertCircle size={20} /> : <Check size={20} />}
                    <span className="text-xs font-bold uppercase">{message}</span>
                </div>
            )}
        </div>
    );
};

export default ManageUsers;
