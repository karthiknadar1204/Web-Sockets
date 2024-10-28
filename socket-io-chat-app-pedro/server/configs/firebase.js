// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBkwhgYj6Bzf67N-n4OQGMmLmkZk1JxG9I",
  authDomain: "octafiles-6c354.firebaseapp.com",
  projectId: "octafiles-6c354",
  storageBucket: "octafiles-6c354.appspot.com",
  messagingSenderId: "847946329709",
  appId: "1:847946329709:web:14c88789c0dac57b2b5964",
  measurementId: "G-59HLNTG8BE"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);