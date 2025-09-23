import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { HttpClientModule, provideHttpClient } from '@angular/common/http';
// import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
// import { getAuth, provideAuth } from '@angular/fire/auth';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

// Configuración de URLs para diferentes entornos
// export const BASE_URL = 'http://192.168.0.100:8080/api'; // Para probar desde otros dispositivos en la red
export const BASE_URL = 'http://localhost:8080/api'; // Para desarrollo local (recomendado)

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    importProvidersFrom(HttpClientModule),
    
    // Firebase - Comentado por ahora, se puede activar si se necesita
    // provideFirebaseApp(() =>
    //   initializeApp({
    //     projectId: 'loginlacteos',
    //     appId: '1:653223671625:web:1f762a68ce989f8d63cc98',
    //     storageBucket: 'loginlacteos.appspot.com',
    //     apiKey: 'AIzaSyCxw2PnP4tEAHhQ279RzELbbN75YrQKysE',
    //     authDomain: 'loginlacteos.firebaseapp.com',
    //     messagingSenderId: '653223671625',
    //   })
    // ),
    // provideAuth(() => getAuth()), 
    
    provideAnimationsAsync(),
  ],
};
