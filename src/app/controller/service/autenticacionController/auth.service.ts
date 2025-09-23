import { Injectable, inject } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Auth, authState, createUserWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithRedirect, getRedirectResult, signInWithPopup } from '@angular/fire/auth';
import {
  getAuth,
  signInWithEmailAndPassword,
} from '@firebase/auth';
import { Router } from '@angular/router';
import { User, UserLogin, UserRegistration, UserSession } from '../../../model/interface/user';
import { EmpleadosService } from './empleados.service';
import { EmpresaContextService } from '../empresa/empresa-context.service';
import { EmpresaService } from '../empresa/empresa.service';
import { BehaviorSubject, Observable, switchMap, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { BASE_URL } from '../../../app.config';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth: Auth = inject(Auth);
  private http = inject(HttpClient);
  private router = inject(Router);
  private empleadosService = inject(EmpleadosService);
  private empresaContext = inject(EmpresaContextService);
  private empresaService = inject(EmpresaService);

  readonly authState$ = authState(this.auth);

  private userSessionSubject: BehaviorSubject<UserSession | null>;
  public userSession$: Observable<UserSession | null>;

  constructor() {
    this.userSessionSubject = new BehaviorSubject<UserSession | null>(null);
    this.userSession$ = this.userSessionSubject.asObservable();
    
    // Cargar sesión desde localStorage al inicializar
    this.cargarSesionDesdeStorage();
    
    // Escuchar cambios en Firebase Auth
    this.authState$.subscribe(firebaseUser => {
      if (!firebaseUser) {
        // Si no hay usuario de Firebase, limpiar sesión completa
        this.limpiarSesion();
      }
    });
  }

  /**
   * Autenticación con email/password para sistema multi-tenant
   */
  async logearse(userLogin: UserLogin): Promise<UserSession> {
    try {
      // 1. Autenticar con Firebase
      const firebaseCredential = await signInWithEmailAndPassword(
        getAuth(),
        userLogin.Usuariocorreo_electronico,
        userLogin.Usuariocontrasena
      );

      // 2. Verificar empresa y usuario en backend
      const userSession = await this.verificarUsuarioEnEmpresa(
        userLogin.Usuariocorreo_electronico, 
        userLogin.EmpresaCodigo
      );

      // 3. Establecer contexto de empresa
      this.empresaContext.setEmpresaActual(userSession.empresa);

      // 4. Guardar sesión
      this.establecerSesion(userSession);

      return userSession;
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  }

  /**
   * Registro de usuario con selección de empresa
   */
  async registrarse(userRegistration: UserRegistration): Promise<UserSession> {
    try {
      // 1. Crear usuario en Firebase
      const firebaseCredential = await createUserWithEmailAndPassword(
        getAuth(),
        userRegistration.Usuariocorreo_electronico,
        userRegistration.Usuariocontrasena
      );

      // 2. Crear usuario en backend con empresa
      const userSession = await this.crearUsuarioEnEmpresa(userRegistration);

      // 3. Establecer contexto de empresa
      this.empresaContext.setEmpresaActual(userSession.empresa);

      // 4. Guardar sesión
      this.establecerSesion(userSession);

      return userSession;
    } catch (error) {
      console.error('Error en registro:', error);
      // Si falla el backend pero Firebase se creó, eliminar usuario de Firebase
      if (getAuth().currentUser) {
        await getAuth().currentUser?.delete();
      }
      throw error;
    }
  }

  /**
   * Login con Google (requiere selección de empresa después)
   */
  async iniciarSesionConGoogle(): Promise<any> {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(this.auth, provider);
    
    // Después del login con Google, el usuario debe seleccionar empresa
    // o será redirigido a una página de selección de empresa
    return result;
  }

  /**
   * Asociar usuario de Google con empresa
   */
  async asociarGoogleConEmpresa(empresaCodigo: number): Promise<UserSession> {
    const currentUser = getAuth().currentUser;
    if (!currentUser?.email) {
      throw new Error('No hay usuario de Google autenticado');
    }

    const userSession = await this.verificarUsuarioEnEmpresa(currentUser.email, empresaCodigo);
    this.empresaContext.setEmpresaActual(userSession.empresa);
    this.establecerSesion(userSession);
    
    return userSession;
  }

  /**
   * Verifica si el usuario existe en la empresa especificada
   */
  private verificarUsuarioEnEmpresa(email: string, empresaCodigo: number): Promise<UserSession> {
    return this.http.post<UserSession>(`${BASE_URL}/auth/verify-user-empresa`, {
      email,
      empresaCodigo
    }).toPromise() as Promise<UserSession>;
  }

  /**
   * Crea un nuevo usuario en el backend asociado a una empresa
   */
  private crearUsuarioEnEmpresa(userRegistration: UserRegistration): Promise<UserSession> {
    return this.http.post<UserSession>(`${BASE_URL}/auth/register-user-empresa`, userRegistration)
      .toPromise() as Promise<UserSession>;
  }

  /**
   * Establece la sesión del usuario
   */
  private establecerSesion(userSession: UserSession): void {
    this.userSessionSubject.next(userSession);
    this.guardarSesionEnStorage(userSession);
  }

  /**
   * Cierra sesión completa
   */
  async cerrarSesion(): Promise<void> {
    try {
      // 1. Limpiar Firebase
      await signOut(getAuth());
      
      // 2. Limpiar contexto local
      this.limpiarSesion();
      
      // 3. Redirigir a login
      this.router.navigateByUrl('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }

  /**
   * Limpia toda la sesión local
   */
  private limpiarSesion(): void {
    this.userSessionSubject.next(null);
    this.empresaContext.limpiarContexto();
    this.empleadosService.clearEmpleados();
    localStorage.removeItem('userSession');
  }

  /**
   * Guarda la sesión en localStorage
   */
  private guardarSesionEnStorage(userSession: UserSession): void {
    try {
      localStorage.setItem('userSession', JSON.stringify(userSession));
    } catch (error) {
      console.error('Error al guardar sesión:', error);
    }
  }

  /**
   * Carga la sesión desde localStorage
   */
  private cargarSesionDesdeStorage(): void {
    try {
      const sessionData = localStorage.getItem('userSession');
      if (sessionData) {
        const userSession: UserSession = JSON.parse(sessionData);
        this.userSessionSubject.next(userSession);
        this.empresaContext.setEmpresaActual(userSession.empresa);
      }
    } catch (error) {
      console.error('Error al cargar sesión:', error);
      localStorage.removeItem('userSession');
    }
  }

  /**
   * Getters de conveniencia
   */
  get currentUserSession(): UserSession | null {
    return this.userSessionSubject.value;
  }

  get currentUser(): User | null {
    return this.currentUserSession?.usuario || null;
  }

  get currentEmpresa() {
    return this.currentUserSession?.empresa || null;
  }

  get isAuthenticated(): boolean {
    return !!this.currentUserSession;
  }

  get isAdmin(): boolean {
    return this.currentUserSession?.empleado?.Cargo === 'Administrador' || false;
  }

  get isSuperAdmin(): boolean {
    return this.currentUserSession?.empleado?.Cargo === 'SuperAdministrador' || false;
  }
}
