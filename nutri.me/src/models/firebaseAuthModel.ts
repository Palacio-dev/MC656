import { auth } from "../config/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  UserCredential,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

export class FirebaseAuthModel {
  async signUp(email: string, password: string): Promise<UserCredential> {
    try {
      return await createUserWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") {
        throw new Error("Este email já está vinculado a uma conta.");
      }
      if (error.code === "auth/invalid-email") {
        throw new Error("Este email não é válido.");
      }
      throw error;
    }
  }

  async login(email: string, password: string): Promise<UserCredential> {
    return await signInWithEmailAndPassword(auth, email, password);
  }

  async loginWithGoogle(): Promise<UserCredential> {
    const provider = new GoogleAuthProvider();
    return await signInWithPopup(auth, provider);
  }

  async logout(): Promise<void> {
    return auth.signOut();
  }
}