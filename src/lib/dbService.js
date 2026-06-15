import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  onSnapshot,
  getDocFromServer
} from 'firebase/firestore';
import { db, auth, isFirebaseConfigured, SIMULATED_DB_KEY } from './firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DeviceEventEmitter } from 'react-native';

const LOCAL_DB_EVENT = 'local-db-update';

export const OperationType = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  LIST: 'list',
  GET: 'get',
  WRITE: 'write',
};

function handleFirestoreError(error, operationType, path) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// --- Simülasyon Veri Deposu ---
const DEFAULT_TOOLS = [
  {
    id: 'tool_1',
    name: 'Bosch Professional Darbeli Matkap',
    description: '800W gücünde, beton ve metal delimine uygun darbe ayarı. Yanında matkap ucu setiyle teslim edilecektir.',
    imageUrl: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=400',
    category: 'Elektrikli',
    ownerId: 'sim_owner_ahmet',
    ownerName: 'Ahmet Yılmaz',
    ownerEmail: 'ahmet@paylas.net',
    latitude: 42,
    longitude: 45,
    status: 'available',
    borrowCount: 6,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'tool_2',
    name: 'Gardena Teleskobik Budama Makası',
    description: 'Yüksek ağaç dallarını budamak için teleskobik sap özellikli, paslanmaz çelik bıçaklar.',
    imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&q=80&w=400',
    category: 'Bahçe',
    ownerId: 'sim_owner_mehmet',
    ownerName: 'Mehmet Demir',
    ownerEmail: 'mehmet@paylas.net',
    latitude: 58,
    longitude: 32,
    status: 'available',
    borrowCount: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'tool_3',
    name: 'Makita Daire Testere',
    description: 'Ahşap kesme işleriniz için profesyonel daire testere. Lütfen kullanırken koruyucu gözlüğünüzü takınız.',
    imageUrl: 'https://images.unsplash.com/photo-1540104845242-a63e9e3d9cdc?auto=format&fit=crop&q=80&w=400',
    category: 'Marangozluk',
    ownerId: 'sim_owner_elif',
    ownerName: 'Elif Kaya',
    ownerEmail: 'elif@paylas.net',
    latitude: 25,
    longitude: 65,
    status: 'available',
    borrowCount: 12,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const DEFAULT_USERS = [
  {
    id: 'sim_owner_ahmet',
    name: 'Ahmet Yılmaz',
    email: 'ahmet@paylas.net',
    borrowCount: 4,
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
    createdAt: new Date().toISOString()
  },
  {
    id: 'sim_owner_mehmet',
    name: 'Mehmet Demir',
    email: 'mehmet@paylas.net',
    borrowCount: 2,
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=150',
    createdAt: new Date().toISOString()
  },
  {
    id: 'sim_owner_elif',
    name: 'Elif Kaya',
    email: 'elif@paylas.net',
    borrowCount: 9,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
    createdAt: new Date().toISOString()
  }
];

async function getLocalDB() {
  try {
    const data = await AsyncStorage.getItem(SIMULATED_DB_KEY);
    if (!data) {
      const freshDb = {
        tools: DEFAULT_TOOLS,
        requests: [],
        profiles: DEFAULT_USERS.reduce((acc, user) => ({ ...acc, [user.id]: user }), {})
      };
      await AsyncStorage.setItem(SIMULATED_DB_KEY, JSON.stringify(freshDb));
      return freshDb;
    }
    return JSON.parse(data);
  } catch (e) {
    console.error("Storage error", e);
    return { tools: [], requests: [], profiles: {} };
  }
}

async function saveLocalDB(dbData) {
  try {
    await AsyncStorage.setItem(SIMULATED_DB_KEY, JSON.stringify(dbData));
    DeviceEventEmitter.emit(LOCAL_DB_EVENT);
  } catch (e) {
    console.error("Error saving to local DB", e);
  }
}

// --- DATABASE SERVICE API LAYER ---

export const dbService = {
  async testConnection() {
    if (!isFirebaseConfigured) return;
    try {
      await getDocFromServer(doc(db, 'test', 'connection'));
    } catch (error) {
      if (error.message && error.message.includes('the client is offline')) {
        console.error("Please check your Firebase configuration.");
      }
    }
  },

  subscribeTools(callback) {
    if (isFirebaseConfigured) {
      const q = collection(db, 'tools');
      return onSnapshot(q, (snapshot) => {
        const tools = [];
        snapshot.forEach((doc) => {
          tools.push({ id: doc.id, ...doc.data() });
        });
        callback(tools);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'tools');
      });
    } else {
      const emitLocal = async () => {
        const local = await getLocalDB();
        callback(local.tools);
      };
      emitLocal();
      const subscription = DeviceEventEmitter.addListener(LOCAL_DB_EVENT, emitLocal);
      return () => {
        subscription.remove();
      };
    }
  },

  async addTool(toolData) {
    const id = 'tool_' + Math.random().toString(36).substring(2, 9);
    const newTool = {
      ...toolData,
      id,
      borrowCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (isFirebaseConfigured) {
      try {
        await setDoc(doc(db, 'tools', id), newTool);
        return id;
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `tools/${id}`);
      }
    } else {
      const state = await getLocalDB();
      state.tools.push(newTool);
      await saveLocalDB(state);
    }
    return id;
  },

  async deleteTool(toolId) {
    if (isFirebaseConfigured) {
      try {
        await deleteDoc(doc(db, 'tools', toolId));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `tools/${toolId}`);
      }
    } else {
      const state = await getLocalDB();
      state.tools = state.tools.filter(t => t.id !== toolId);
      state.requests = state.requests.filter(req => req.toolId !== toolId);
      await saveLocalDB(state);
    }
  },

  async updateTool(toolId, updates) {
    const timestamp = new Date().toISOString();
    if (isFirebaseConfigured) {
      try {
        await updateDoc(doc(db, 'tools', toolId), { ...updates, updatedAt: timestamp });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `tools/${toolId}`);
      }
    } else {
      const state = await getLocalDB();
      state.tools = state.tools.map(t => t.id === toolId ? { ...t, ...updates, updatedAt: timestamp } : t);
      await saveLocalDB(state);
    }
  },

  subscribeRequests(userId, callback) {
    if (isFirebaseConfigured) {
      const q = collection(db, 'requests');
      return onSnapshot(q, (snapshot) => {
        const reqs = [];
        snapshot.forEach((doc) => {
          const req = doc.data();
          if (req.borrowerId === userId || req.ownerId === userId) {
            reqs.push({ id: doc.id, ...req });
          }
        });
        callback(reqs);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'requests');
      });
    } else {
      const emitLocal = async () => {
        const local = await getLocalDB();
        const filtered = local.requests.filter(r => r.borrowerId === userId || r.ownerId === userId);
        callback(filtered);
      };
      emitLocal();
      const subscription = DeviceEventEmitter.addListener(LOCAL_DB_EVENT, emitLocal);
      return () => {
        subscription.remove();
      };
    }
  },

  async createBorrowRequest(reqData) {
    const id = 'req_' + Math.random().toString(36).substring(2, 9);
    const pickupQrCode = 'PICKUP_QR_' + Math.random().toString(36).substring(2, 10).toUpperCase();
    const returnQrCode = 'RETURN_QR_' + Math.random().toString(36).substring(2, 10).toUpperCase();

    const timestamp = new Date().toISOString();
    const newRequest = {
      ...reqData,
      id,
      pickupQrCode,
      returnQrCode,
      createdAt: timestamp,
      updatedAt: timestamp
    };

    if (isFirebaseConfigured) {
      try {
        await setDoc(doc(db, 'requests', id), newRequest);
        await updateDoc(doc(db, 'tools', reqData.toolId), { status: 'requested', updatedAt: timestamp });
        return id;
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `requests/${id}`);
      }
    } else {
      const state = await getLocalDB();
      state.requests.push(newRequest);
      state.tools = state.tools.map(t => t.id === reqData.toolId ? { ...t, status: 'requested', updatedAt: timestamp } : t);
      await saveLocalDB(state);
    }
    return id;
  },

  async updateRequestStatus(requestId, status, actorId) {
    const timestamp = new Date().toISOString();
    
    if (isFirebaseConfigured) {
      try {
        const reqRef = doc(db, 'requests', requestId);
        const reqSnap = await getDoc(reqRef);
        if (!reqSnap.exists()) return;
        const req = reqSnap.data();

        await updateDoc(reqRef, { status, updatedAt: timestamp });

        if (status === 'rejected') {
          await updateDoc(doc(db, 'tools', req.toolId), { status: 'available', updatedAt: timestamp });
        } else if (status === 'received') {
          await updateDoc(doc(db, 'tools', req.toolId), { 
            status: 'borrowed', 
            borrowedById: req.borrowerId, 
            borrowedByName: req.borrowerName,
            borrowCount: (await getDoc(doc(db, 'tools', req.toolId))).data()?.borrowCount + 1,
            updatedAt: timestamp 
          });
        } else if (status === 'returned') {
          await updateDoc(doc(db, 'tools', req.toolId), { 
            status: 'available', 
            borrowedById: null, 
            borrowedByName: null,
            updatedAt: timestamp 
          });

          const userRef = doc(db, 'users', req.borrowerId);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const currentCount = userSnap.data().borrowCount || 0;
            await updateDoc(userRef, { borrowCount: currentCount + 1 });
          }
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `requests/${requestId}`);
      }
    } else {
      const state = await getLocalDB();
      const reqIndex = state.requests.findIndex(r => r.id === requestId);
      if (reqIndex === -1) return;
      
      const req = state.requests[reqIndex];
      req.status = status;
      req.updatedAt = timestamp;

      if (status === 'rejected') {
        state.tools = state.tools.map(t => t.id === req.toolId ? { ...t, status: 'available', updatedAt: timestamp } : t);
      } else if (status === 'received') {
        state.tools = state.tools.map(t => t.id === req.toolId ? { 
          ...t, 
          status: 'borrowed', 
          borrowedById: req.borrowerId, 
          borrowedByName: req.borrowerName,
          borrowCount: t.borrowCount + 1,
          updatedAt: timestamp 
        } : t);
      } else if (status === 'returned') {
        state.tools = state.tools.map(t => t.id === req.toolId ? { 
          ...t, 
          status: 'available', 
          borrowedById: null, 
          borrowedByName: null,
          updatedAt: timestamp 
        } : t);

        if (state.profiles[req.borrowerId]) {
          state.profiles[req.borrowerId].borrowCount += 1;
        } else {
          state.profiles[req.borrowerId] = {
            id: req.borrowerId,
            name: req.borrowerName,
            email: 'borrower@simulation.net',
            borrowCount: 1,
            createdAt: timestamp
          };
        }
      }
      await saveLocalDB(state);
    }
  },

  async getUserProfile(userId, name, email) {
    const timestamp = new Date().toISOString();
    if (isFirebaseConfigured) {
      try {
        const uRef = doc(db, 'users', userId);
        const uSnap = await getDoc(uRef);
        if (uSnap.exists()) {
          return uSnap.data();
        } else {
          const newProfile = {
            id: userId,
            name: name || 'Yeni Paylaşımcı',
            email: email || '',
            borrowCount: 0,
            createdAt: timestamp
          };
          await setDoc(uRef, newProfile);
          return newProfile;
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `users/${userId}`);
      }
    }
    
    const state = await getLocalDB();
    if (state.profiles[userId]) {
      return state.profiles[userId];
    } else {
      const newProfile = {
        id: userId,
        name: name || 'Misafir Kullanıcı',
        email: email || 'guest@example.com',
        borrowCount: 0,
        createdAt: timestamp
      };
      state.profiles[userId] = newProfile;
      await saveLocalDB(state);
      return newProfile;
    }
  }
};
