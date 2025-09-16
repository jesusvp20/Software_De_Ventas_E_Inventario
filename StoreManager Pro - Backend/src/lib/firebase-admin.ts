// /lib/firebase-admin.ts
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Configuración desde variables de entorno
const firebaseAdminConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

// Función para verificar si Firebase Admin está configurado correctamente
const isFirebaseConfigured = () => {
  return firebaseAdminConfig.projectId &&
         firebaseAdminConfig.clientEmail &&
         firebaseAdminConfig.privateKey &&
         !firebaseAdminConfig.privateKey.includes('TEMP_KEY_PLACEHOLDER');
};

let adminAuth: ReturnType<typeof getAuth> | null = null;
let adminDb: ReturnType<typeof getFirestore> | null = null;

// Inicializar Firebase Admin solo si las credenciales son válidas
if (isFirebaseConfigured()) {
  try {
    if (!getApps().length) {
      initializeApp({
        credential: cert(firebaseAdminConfig),
        projectId: firebaseAdminConfig.projectId,
      });
      console.log('✅ Firebase Admin SDK inicializado correctamente');
    }
    adminAuth = getAuth();
    adminDb = getFirestore();
  } catch (error) {
    console.error('❌ Error inicializando Firebase Admin SDK:', error);
  }
} else {
  console.warn('⚠️ Firebase Admin SDK no configurado. Usando modo de desarrollo.');
}

// Exportaciones
export { adminAuth, adminDb, isFirebaseConfigured };
export default { adminAuth, adminDb, isFirebaseConfigured };
