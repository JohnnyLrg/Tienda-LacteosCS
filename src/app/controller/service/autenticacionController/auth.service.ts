import { Injectable, inject } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Auth, authState, createUserWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithRedirect, getRedirectResult, signInWithPopup, updateProfile, sendPasswordResetEmail } from '@angular/fire/auth';
// import { AngularFirestore } from '@angular/fire/compat/firestore';
import {
  getAuth,
  signInWithEmailAndPassword,
} from '@firebase/auth';
import { Router } from '@angular/router';
import { User, UserLogin } from '../../../model/interface/user';
import { EmpleadosService } from './empleados.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth: Auth = inject(Auth);
  readonly authState$ = authState(this.auth);

  private userSubject: BehaviorSubject<any>;
  public user$: Observable<any>;

  // firestore = inject(AngularFirestore);
  router = inject(Router);
  private empleadosService = inject(EmpleadosService);


  constructor() {
    this.userSubject = new BehaviorSubject<any>(null);
    this.user$ = this.userSubject.asObservable();
    this.authState$.subscribe(user => this.userSubject.next(user));
  }

  getAuth() {
    return getAuth();
  }

  logearse(user: UserLogin) {
    return signInWithEmailAndPassword(
      getAuth(),
      user.Usuariocorreo_electronico,
      user.Usuariocontrasena
    );
  }

  registrarse(user: User) {
    return createUserWithEmailAndPassword(
      getAuth(),
      user.Usuariocorreo_electronico,
      user.Usuariocontrasena
    );
  }

   iniciarSesionConGoogle() {
     const provider = new GoogleAuthProvider();
     return signInWithPopup(this.auth, provider);
    //  return signInWithRedirect(this.auth, provider);
   }


  cerrarSesion() {
    const auth = getAuth();
    this.empleadosService.clearEmpleados();
    // router.navigateByUrl('/login');
    return signOut(auth);
  }

  get currentUser() {
    return this.userSubject.value;
  }

  async getCurrentUser() {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      try {
        const db = getFirestore();
        const userDoc = await getDoc(doc(db, 'customers', user.uid));
        if (userDoc.exists()) {
          return { uid: user.uid, email: user.email, ...userDoc.data() };
        } else {
          return { uid: user.uid, email: user.email };
        }
      } catch (error) {
        console.error('Error getting user data:', error);
        return { uid: user.uid, email: user.email };
      }
    }
    return null;
  }

  async updateUserProfile(uid: string, userData: any) {
    const db = getFirestore();
    await setDoc(doc(db, 'customers', uid), userData, { merge: true });
  }

  async sendPasswordResetEmail(email: string) {
    const auth = getAuth();
    return sendPasswordResetEmail(auth, email);
  }

  async logout() {
    return this.cerrarSesion();
  }
}
