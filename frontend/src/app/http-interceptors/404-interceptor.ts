import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpClient } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';


// 404 error interceptor in charge of routing to 404 page
@Injectable()
export class NotFoundInterceptor implements HttpInterceptor {

  constructor(
    private auth: AuthService,
    private router: Router,
    private http: HttpClient
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
        catchError((error) => {
            if (error.status == 404) {
                this.router.navigate(['/404']);
            }
            return throwError(() => error);
        }));
    }
}