import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpClient } from '@angular/common/http';
import { catchError, Observable, throwError, switchMap } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';
import { NotificationService } from '../notification/notification.service';


// HTTP interceptor in charge of adding JWT credentials to HTTP requests
@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private auth: AuthService,
    private router: Router,
    private http: HttpClient,
    private notification: NotificationService
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Intercept to add auth cookies only if you're not trying to refresh (to avoid recursion)
    if (!req.url.endsWith('auth/refresh')) {
      // Adds credentials (JWT Authorization Cookie) to the request
      const reqWithCredentials = req.clone({withCredentials: true});
      // If there is a 401 error, catch it
      return next.handle(reqWithCredentials).pipe(
        catchError((error) => {
          if (error.status == 401) {
            return this.handle401Error(reqWithCredentials, next, error);
          } else if (error.status == 403) {
            this.notification.notify("This action is not authorized.");
            return throwError(() => error);
          } else {
            return throwError(() => error);
          }
        })
      );
    } else {
      return next.handle(req);
    }
  }

  handle401Error(req: HttpRequest<any>, next: HttpHandler, originalError: any) {
    // Refresh cookies and redo the request
    return this.auth.refreshAuthCookie().pipe(
      switchMap(() => {
        const reqWithNewCredentials = req.clone({withCredentials: true});
        return next.handle(reqWithNewCredentials);
      }),
      catchError((error) => {
        // If there was an error during refresh, log out the user and redirect to login page
        this.auth.logout();
        this.router.navigate(['/login']);
        return throwError(() => originalError);
      })
    );
  }
}