import { HTTP_INTERCEPTORS } from '@angular/common/http';

// Import the HTTP interceptors here
import { AuthInterceptor } from './auth-interceptor';
import { NotFoundInterceptor } from './404-interceptor';

// Put the HTTP interceptors in "out to in" order
export const httpInterceptorProviders = [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: NotFoundInterceptor, multi: true}
  ];