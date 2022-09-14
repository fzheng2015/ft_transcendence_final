import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { map, observable, Observable, Subject } from 'rxjs';
import { observableToBeFn } from 'rxjs/internal/testing/TestScheduler';
import { environment } from 'src/environments/environment';
import { GameService } from '../game/game.service';


// Keeps track of the logged in user
// In addition, there are some utilities to check the user and refresh the JWT cookies
// Uses localStorage for persistence between tabs

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  logChange = new Subject<{previous: number, next: number}>();
  private idCache: number = -1;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    if (!localStorage.getItem('loggedIn')) {
      localStorage.setItem('loggedIn', 'false');
    }
    if (!localStorage.getItem('id')) {
      localStorage.setItem('id', '-1');
      this.idCache = Number(localStorage.getItem('id'));
    }

    setInterval(()=> {
      let newId = Number(localStorage.getItem('id'));
      if (this.idCache != newId) {
         this.logChange.next({previous: this.idCache, next: newId });
        this.idCache = newId;
      }
    }, 2000);

    this.logChange.subscribe((logChange) => {
      if (logChange.next == -1) {
        this.router.navigate(['/login']);
      }
    })
  }

  // Logs in the user
  login(id: number) {
    localStorage.setItem('loggedIn', 'true');
    localStorage.setItem('id', String(id));
    this.logChange.next({previous: this.idCache, next: id});
    this.idCache = id;
  }

  // Logs out the user
  logout() {
    const url = environment.BACKEND_URL_API + 'auth/logout';
    this.http.post(url, {}, { withCredentials: true });
    localStorage.setItem('loggedIn', 'false');
    localStorage.setItem('id', '-1');
    this.logChange.next({previous: this.idCache, next: -1});
    this.idCache = -1;
  }

  // Utility function to call the JWT refresh endpoint used by AuthInterceptor
  refreshAuthCookie(): Observable<any> {
    return this.http.get(environment.BACKEND_URL_API + 'auth/refresh', { withCredentials: true, responseType: 'text' });
  }

  // Utility function to check if user id matches with token
  checkUser(id: number): Observable<boolean> {
    return this.http.get(environment.BACKEND_URL_API + 'auth/check/' + id, { responseType: 'text', observe: 'response' }).pipe(
      map(res => {
        return res.status == 200;
      })
    );
  }

  isLoggedIn(): boolean {
    return localStorage.getItem('loggedIn') == 'true';
  }

  // Returns -1 if not logged in !
  getId(): number {
    return Number(localStorage.getItem('id'));
  }

  getGenTfa(): Observable<Blob> {
    const imageUrl = environment.BACKEND_URL_API + 'tfa/generate';
    return this.http.post<Blob>(imageUrl, {}, {
      responseType: 'blob' as 'json',
      withCredentials: true,
    });
  }

  getTfaStatus(): Observable<any> {
    const url = environment.BACKEND_URL_API + 'tfa/tfa-status';
    return this.http.get(url, { withCredentials: true, observe: 'body' });
  }

  loginTfaCheck(tfaCode: string): Observable<any> {
    const body = { "tfaCode": tfaCode };
    const loginTfaCheckUrl = environment.BACKEND_URL_API + 'tfa/loginTfaCheck';
    return this.http.post(loginTfaCheckUrl, body, { withCredentials: true, observe: 'response' });
  }

  switchOffTfa(): Observable<any> {
    const turnoffUrl = environment.BACKEND_URL_API + 'tfa/turnoff';
    return this.http.post(turnoffUrl, {}, { withCredentials: true });
  }
  switchOnTfa(): Observable<any> {
    const turnonUrl = environment.BACKEND_URL_API + 'tfa/turnon';
    return this.http.post(turnonUrl, {}, { withCredentials: true });
  }

  rmTfaSecret(): Observable<any> {
    const url = environment.BACKEND_URL_API + 'tfa/tfa-del';
    return this.http.get(url, { withCredentials: true });
  }

  isTfaCodeValid(tfaCode: string): Observable<any> {
    const body = { "tfaCode": tfaCode };
    const url = environment.BACKEND_URL_API + 'tfa/isCodeValid';
    return this.http.post(url, body, { withCredentials: true });
  }
}
