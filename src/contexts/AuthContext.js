import React, { createContext, useContext, useState, useEffect } from 'react';
import { isFirebaseConfigured, auth } from '../lib/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile as firebaseUpdateProfile,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Local Auth Constants
const LOCAL_USERS_KEY  = 'cs_users_db_rn';
const LOCAL_SESSION_KEY = 'cs_active_session_rn';

import { encode } from 'base-64';

function hashPassword(email, password) {
  return encode(encodeURIComponent(email.toLowerCase() + ':' + password));
}

async function getUsersDB() {
  try {
    const data = await AsyncStorage.getItem(LOCAL_USERS_KEY);
    return data ? JSON.parse(data) : {};
  } catch { return {}; }
}

async function saveUsersDB(db) {
  await AsyncStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(db));
}

async function getSession() {
  try {
    const raw = await AsyncStorage.getItem(LOCAL_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

async function saveSession(user) {
  await AsyncStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(user));
}

async function clearSession() {
  await AsyncStorage.removeItem(LOCAL_SESSION_KEY);
}

const localAuth = {
  async register(name, email, password) {
    const db = await getUsersDB();
    const key = email.toLowerCase();
    if (db[key]) throw new Error('Bu e-posta adresiyle zaten bir hesap mevcut.');

    const user = {
      id: 'local_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
      email: key,
      name: name.trim(),
      passwordHash: hashPassword(key, password),
      borrowCount: 0,
      createdAt: new Date().toISOString(),
    };
    db[key] = user;
    await saveUsersDB(db);

    const authUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      borrowCount: user.borrowCount,
      createdAt: user.createdAt,
    };
    await saveSession(authUser);
    return authUser;
  },

  async login(email, password) {
    const db = await getUsersDB();
    const key = email.toLowerCase();
    const stored = db[key];
    if (!stored) throw new Error('Bu e-posta adresiyle kayıtlı hesap bulunamadı.');
    if (stored.passwordHash !== hashPassword(key, password))
      throw new Error('E-posta veya şifre hatalı. Lütfen tekrar deneyin.');

    const authUser = {
      id: stored.id,
      email: stored.email,
      name: stored.name,
      avatar: stored.avatar,
      borrowCount: stored.borrowCount,
      createdAt: stored.createdAt,
    };
    await saveSession(authUser);
    return authUser;
  },

  async logout() {
    await clearSession();
  },

  getSession,
};

function firebaseUserToAuthUser(fbUser) {
  return {
    id: fbUser.uid,
    email: fbUser.email || '',
    name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Kullanıcı',
    avatar: fbUser.photoURL || undefined,
    borrowCount: 0,
    createdAt: fbUser.metadata.creationTime || new Date().toISOString(),
  };
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (isFirebaseConfigured && auth) {
        const unsub = onAuthStateChanged(auth, (fbUser) => {
          setUser(fbUser ? firebaseUserToAuthUser(fbUser) : null);
          setLoading(false);
        });
        return unsub;
      } else {
        const session = await localAuth.getSession();
        setUser(session);
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    if (isFirebaseConfigured && auth) {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      setUser(firebaseUserToAuthUser(cred.user));
    } else {
      const u = await localAuth.login(email, password);
      setUser(u);
    }
  };

  const register = async (name, email, password) => {
    if (isFirebaseConfigured && auth) {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await firebaseUpdateProfile(cred.user, { displayName: name });
      setUser({ ...firebaseUserToAuthUser(cred.user), name });
    } else {
      const u = await localAuth.register(name, email, password);
      setUser(u);
    }
  };

  const logout = async () => {
    if (isFirebaseConfigured && auth) {
      await firebaseSignOut(auth);
    } else {
      await localAuth.logout();
    }
    setUser(null);
  };

  const updateUser = async (updates) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      if (!isFirebaseConfigured) saveSession(updated); // Background async save
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
