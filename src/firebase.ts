import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  Firestore
} from 'firebase/firestore';

const firebaseConfig = {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'cloudiaudi',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:727255235272:web:6df5a957c5422197b003fd',
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyCVCm-GV7-V6vujtnqRb_nuETO-mg1B9LE',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'cloudiaudi.firebaseapp.com',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'cloudiaudi.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '727255235272',
};

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write'
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const currentAuth = auth.currentUser;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentAuth?.uid || null,
      email: currentAuth?.email || null,
      emailVerified: currentAuth?.emailVerified || null,
      isAnonymous: currentAuth?.isAnonymous || null,
      tenantId: currentAuth?.tenantId || null,
      providerInfo:
        currentAuth?.providerData?.map((p) => ({
          providerId: p.providerId,
          email: p.email
        })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
const databaseId = import.meta.env.VITE_FIREBASE_DATABASE_ID;
export const db: Firestore = databaseId ? getFirestore(app, databaseId) : getFirestore(app);

// CRMos (crmosone-dev) Secondary Firebase Connection for Direct CRM Sync
const crmosFirebaseConfig = {
  projectId: import.meta.env.VITE_CRMOS_PROJECT_ID || 'crmosone-dev',
  appId: import.meta.env.VITE_CRMOS_APP_ID || '1:560657459503:web:cafda0014c240cdc7099da',
  apiKey: import.meta.env.VITE_CRMOS_API_KEY || 'AIzaSyCsBPKp7i7Cd959bF8hZzTDtV_V_7cI9Xo',
  authDomain: import.meta.env.VITE_CRMOS_AUTH_DOMAIN || 'crmosone-dev.firebaseapp.com',
  storageBucket: import.meta.env.VITE_CRMOS_STORAGE_BUCKET || 'crmosone-dev.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_CRMOS_MESSAGING_SENDER_ID || '560657459503',
};

const existingCrmosApp = getApps().find((a) => a.name === 'crmos');
const crmosApp = existingCrmosApp || initializeApp(crmosFirebaseConfig, 'crmos');
export const crmosDb: Firestore = getFirestore(crmosApp);

export async function verifyFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'users', 'connection_health_check'));
    return true;
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('the client is offline')) {
      console.warn('Firebase client is offline of verbindingscontrole mislukt:', err);
    }
    return false;
  }
}
