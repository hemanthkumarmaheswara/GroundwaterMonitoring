// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBlUT0dz9HBdLdwMBTxytZpO5lC9LH1-74",
    authDomain: "groundwatermonitoring-4430.firebaseapp.com",
    projectId: "groundwatermonitoring-4430",
    storageBucket: "groundwatermonitoring-4430.firebasestorage.app",
    messagingSenderId: "259920937280",
    appId: "1:259920937280:web:12591d104db614e1127aa5",
    measurementId: "G-HHGT5H1F1J"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

// Initialize Analytics conditionally (client-side only)
let analytics;
if (typeof window !== 'undefined') {
    isSupported().then(supported => {
        if (supported) {
            analytics = getAnalytics(app);
        }
    });
}

export { app, auth, analytics };
