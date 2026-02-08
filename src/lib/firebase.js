import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyAOQfJsgU0zL18Am-bOlVawbsj0FP5gxHk",
    authDomain: "agbizu.firebaseapp.com",
    databaseURL: "https://agbizu-default-rtdb.firebaseio.com",
    projectId: "agbizu",
    storageBucket: "agbizu.firebasestorage.app",
    messagingSenderId: "728975401166",
    appId: "1:728975401166:web:8948779b41eec86af4709f",
    measurementId: "G-Z8BXT3XBKW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
