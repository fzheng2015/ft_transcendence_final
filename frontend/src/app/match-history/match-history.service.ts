import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { IMatch } from './match.interface';
import { IStats } from './stats.interface';

@Injectable({
  providedIn: 'root'
})
export class MatchHistoryService {

  constructor(private http: HttpClient) { }

  getMatchHistory(id: number): Observable<IMatch[]> {
    return this.http.get<IMatch[]>(environment.BACKEND_URL_API + 'history/' + id);
  }

  getStats(id: number): Observable<IStats[]> {
    return this.http.get<IStats[]>(environment.BACKEND_URL_API + 'history/stats/' + id);
  }

}
