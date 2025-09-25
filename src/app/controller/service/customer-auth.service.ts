import { Injectable } from '@angular/core';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, User, sendPasswordResetEmail } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, Firestore } from 'firebase/firestore';
import { BehaviorSubject, Observable } from 'rxjs';
import { customerFirebaseConfig } from '../../customer-firebase.config';

@Injectable({
  providedIn: 'root'
})
export class CustomerAuthService {
  private customerApp: FirebaseApp;
  private customerAuth: Auth;
  private customerDb: Firestore;
  
  private userSubject: BehaviorSubject<User | null>;
  public user$: Observable<User | null>;

  constructor() {
    // Inicializar Firebase para clientes
    this.customerApp = initializeApp(customerFirebaseConfig, 'customer-app');
    this.customerAuth = getAuth(this.customerApp);
    this.customerDb = getFirestore(this.customerApp);
    
    // Configurar observable del usuario
    this.userSubject = new BehaviorSubject<User | null>(null);
    this.user$ = this.userSubject.asObservable();
    
    // Escuchar cambios de estado
    onAuthStateChanged(this.customerAuth, (user: User | null) => {
      this.userSubject.next(user);
    });
  }

  // Registro de cliente
  async registerCustomer(email: string, password: string, additionalData?: any) {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.customerAuth, email, password);
      const user = userCredential.user;
      
      // Guardar datos adicionales en Firestore
      if (additionalData) {
        await this.updateCustomerProfile(user.uid, additionalData);
      }
      
      return userCredential;
    } catch (error) {
      console.error('Error registrando cliente:', error);
      throw error;
    }
  }

  // Login de cliente
  async loginCustomer(email: string, password: string) {
    try {
      return await signInWithEmailAndPassword(this.customerAuth, email, password);
    } catch (error) {
      console.error('Error login cliente:', error);
      throw error;
    }
  }

  // Login con Google (para clientes)
  async loginCustomerWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      return await signInWithPopup(this.customerAuth, provider);
    } catch (error) {
      console.error('Error login Google cliente:', error);
      throw error;
    }
  }

  // Logout
  async logout() {
    try {
      await signOut(this.customerAuth);
    } catch (error) {
      console.error('Error logout cliente:', error);
      throw error;
    }
  }

  // Enviar email de reset de contraseña
  async sendPasswordResetEmail(email: string) {
    try {
      await sendPasswordResetEmail(this.customerAuth, email);
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw error;
    }
  }

  // Obtener usuario actual
  getCurrentUser(): User | null {
    return this.customerAuth.currentUser;
  }

  // Actualizar perfil de cliente
  async updateCustomerProfile(uid: string, data: any) {
    try {
      await setDoc(doc(this.customerDb, 'customers', uid), data, { merge: true });
    } catch (error) {
      console.error('Error actualizando perfil cliente:', error);
      throw error;
    }
  }

  // Obtener perfil de cliente
  async getCustomerProfile(uid: string) {
    try {
      const docSnap = await getDoc(doc(this.customerDb, 'customers', uid));
      return docSnap.exists() ? docSnap.data() : null;
    } catch (error) {
      console.error('Error obteniendo perfil cliente:', error);
      throw error;
    }
  }
}