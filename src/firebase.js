import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD7VE24_CnYLYnU159LtQh0N7T1nX3_VwI",
  authDomain: "gestaomotoca.firebaseapp.com",
  projectId: "gestaomotoca",
  storageBucket: "gestaomotoca.firebasestorage.app",
  messagingSenderId: "485173163303",
  appId: "1:485173163303:web:4b9c5b812792983193a502"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);