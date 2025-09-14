import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const firebaseAdminConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

// Verificar si las credenciales están configuradas
const isFirebaseConfigured = () => {
  return firebaseAdminConfig.projectId && 
         firebaseAdminConfig.clientEmail && 
         firebaseAdminConfig.privateKey && 
         !firebaseAdminConfig.privateKey.includes('TEMP_KEY_PLACEHOLDER');
};

let adminAuth: any = null;
let adminDb: any = null;

// Inicializar Firebase Admin solo si las credenciales están configuradas
if (isFirebaseConfigured()) {
  try {
    if (!getApps().length) {
      initializeApp({
        credential: cert(firebaseAdminConfig),
        projectId: process.env.FIREBASE_PROJECT_ID,
      });
    }
    adminAuth = getAuth();
    adminDb = getFirestore();
    console.log('✅ Firebase Admin SDK inicializado correctamente');
  } catch (error) {
    console.error('❌ Error inicializando Firebase Admin SDK:', error);
  }
} else {
  console.warn('⚠️ Firebase Admin SDK no configurado. Usando modo de desarrollo.');
}

export { adminAuth, adminDb, isFirebaseConfigured };
export default { adminAuth, adminDb, isFirebaseConfigured };