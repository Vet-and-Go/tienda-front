import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class Http {
  private readonly baseUrl: string = 'http://localhost:8082/api';

  constructor(private http: HttpClient) { }

  getAll<T>(route: string, params?: HttpParams): Observable<T[]> {
    return this.http.get<T[]>(`${this.baseUrl}/${route}`, { params });
  }

  getWithParams<T>(route: string, params: HttpParams): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/${route}`, { params });
  }

  getById<T>(route: string): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/${route}`);
  }

  create<T>(route: string, newObject: T): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}/${route}`, newObject);
  }

  update<T>(route: string, newObject: T): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}/${route}`, newObject);
  }

  deleteById<T>(route: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}/${route}`);
  }

  getByName<T>(route: string): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/${route}`);
  }
}
