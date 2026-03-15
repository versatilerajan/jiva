import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { auth, googleProvider, githubProvider } from "../firebase";
import { syncUser } from "../services/api";

export const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [dbUser, setDbUser]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const res = await syncUser({ name: firebaseUser.displayName });
          setDbUser(res.data.user);
        } catch (e) {
          console.error("Sync failed:", e);
        }
      } else {
        setDbUser(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const loginWithGoogle  = ()                => signInWithPopup(auth, googleProvider);
  const loginWithGithub  = ()                => signInWithPopup(auth, githubProvider);
  const loginWithEmail   = (email, password) => signInWithEmailAndPassword(auth, email, password);
  const logout           = ()                => signOut(auth);

  const registerWithEmail = async (name, email, password) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    return cred;
  };

  const refreshDbUser = async () => {
    if (auth.currentUser) {
      const res = await syncUser({ name: auth.currentUser.displayName });
      setDbUser(res.data.user);
    }
  };

  return (
    <AuthContext.Provider value={{
      user, dbUser, loading,
      loginWithGoogle, loginWithGithub,
      loginWithEmail, registerWithEmail,
      logout, refreshDbUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);