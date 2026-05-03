import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCnQgs8JX1K1vECBF4DfO0IPG3JViwpsEg",
  authDomain: "gamon-era.firebaseapp.com",
  projectId: "gamon-era",
  storageBucket: "gamon-era.firebasestorage.app",
  messagingSenderId: "479388713644",
  appId: "1:479388713644:web:e91e94cf945fec58e19509",
  measurementId: "G-3QP3P8JW3X"
};

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    isAnonymous?: boolean | null;
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      // Note: We don't have access to 'auth' here without importing it
      userId: null,
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
