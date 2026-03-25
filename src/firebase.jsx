import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyATOaDyx7aCsYX9-rWurYEMCCMhevggWXs",
  authDomain: "jiva-5f50c.firebaseapp.com",
  projectId: "jiva-5f50c",
  storageBucket: "jiva-5f50c.firebasestorage.app",
  messagingSenderId: "563053665604",
  appId: "1:563053665604:web:dfffc03c689768733ccb11",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();
export default app;
