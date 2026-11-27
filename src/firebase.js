import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyB2oS5VTBje1mJgbmGDd2xmXqC1TqEsbn8",
    authDomain: "hackathon-team-finder-55b9f.firebaseapp.com",
    projectId: "hackathon-team-finder-55b9f",
    storageBucket: "hackathon-team-finder-55b9f.firebasestorage.app",
    messagingSenderId: "846107985719",
    appId: "1:846107985719:web:378a14492d7a7a0970bcb2"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
