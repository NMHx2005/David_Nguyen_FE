import { ApplicationConfig, ErrorHandler } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth.interceptor';
import { ErrorHandlerService, httpErrorInterceptor, httpRetryInterceptor, loadingInterceptor } from './services/error-handler.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(withInterceptors([
      authInterceptor,
      httpErrorInterceptor(),
      httpRetryInterceptor(),
      loadingInterceptor()
    ])),
    { provide: ErrorHandler, useClass: ErrorHandlerService }
  ]
};
