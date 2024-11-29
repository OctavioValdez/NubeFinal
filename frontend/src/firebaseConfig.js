// Importar funciones necesarias de Firebase
import { initializeApp } from "firebase/app";
import { initializeAuth, indexedDBLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyD-JNe4J__rac0e9_ktVeu56uXJw9Dnkmw",
  authDomain: "appcd-9b467.firebaseapp.com",
  projectId: "appcd-9b467",
  storageBucket: "appcd-9b467.appspot.com",
  messagingSenderId: "1085180081291",
  appId: "1:1085180081291:web:00ca3b104cc3b12f7ed08e",
};

// Inicialización de Firebase
const app = initializeApp(firebaseConfig);

// Configurar `initializeAuth` con persistencia
export const auth = initializeAuth(app, {
  persistence: indexedDBLocalPersistence, // Persistencia basada en IndexedDB para aplicaciones web
});

export const db = getFirestore(app);
