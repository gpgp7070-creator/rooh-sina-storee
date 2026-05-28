import { initializeApp, getApps } from "firebase/app"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyBUdvFIs7rovudq820q1RjN9T7eANHtMXg",
  authDomain: "rooh-sina.firebaseapp.com",
  projectId: "rooh-sina",
  storageBucket: "rooh-sina.firebasestorage.app",
  messagingSenderId: "397495170281",
  appId: "1:397495170281:web:c6ee86adc5d1b833b72c78"
};

// Initialize Firebase only if it hasn't been initialized
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
const db = getFirestore(app)

export { db }
