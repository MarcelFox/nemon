import { ApplicationConfig, DEFAULT_CURRENCY_CODE, LOCALE_ID, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

export const appConfig: ApplicationConfig = {
  providers: [
    {
      provide: DEFAULT_CURRENCY_CODE,
      useValue: 'BRL',
    },
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(), provideFirebaseApp(() => initializeApp({"projectId":"nemon-storage","appId":"1:388497713280:web:d1111e3abeecdd40cc9e65","storageBucket":"nemon-storage.appspot.com","apiKey":"AIzaSyBY8a9Uep9i-gslLvTOuwS4qj6Aj1KEh-k","authDomain":"nemon-storage.firebaseapp.com","messagingSenderId":"388497713280"})), provideFirestore(() => getFirestore()),
  ],
};
