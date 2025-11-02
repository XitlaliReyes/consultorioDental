import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http'; 
import { provideAuth0 } from '@auth0/auth0-angular';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    provideAuth0({
      domain: 'dev-7iloabq8ips3sdq0.us.auth0.com',
      clientId: 'gGOlcbSQY0q460XDOEGqOZu6DOB1MA8j',
      authorizationParams: {
        redirect_uri: `${window.location.origin}/callback`,
        audience: 'https://dev-7iloabq8ips3sdq0.us.auth0.com/api/v2/'
      },
      cacheLocation: 'localstorage',
      useRefreshTokens: true
    })
  ]
};