import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Http } from '../http/http.service';
import { RegisterRequest, RegisterResponse, LoginRequest, LoginResponse } from '../../../models/auth.models';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly USER_KEY = 'auth-user';
    private readonly TOKEN_KEY = 'auth-token';

    private currentUserSubject = new BehaviorSubject<LoginResponse | null>(this.getUserFromStorage());
    public currentUser$ = this.currentUserSubject.asObservable();

    constructor(private http: Http) { }

    register(request: RegisterRequest): Observable<RegisterResponse> {
        return this.http.create<RegisterResponse>('users/register', request as any);
    }

    login(request: LoginRequest): Observable<LoginResponse> {
        // Endpoint: POST /api/users/auth/login/{role} -> 'user' for normal clients
        return this.http.create<LoginResponse>('users/auth/login/user', request as any).pipe(
            tap(response => {
                this.saveSession(response);
            })
        );
    }

    logout(): void {
        const user = this.currentUserSubject.value;
        if (user && user.username) {
            // Server-side logout: POST /api/users/auth/logout with body { "username": ... }
            this.http.create('users/auth/logout', { username: user.username }).subscribe({
                next: () => console.log('Server logout successful'),
                error: (err) => console.error('Server logout failed', err)
            });
        }

        // Client-side cleanup
        localStorage.removeItem(this.USER_KEY);
        localStorage.removeItem(this.TOKEN_KEY);
        this.currentUserSubject.next(null);
    }

    validateSession(token: string): Observable<any> {
        return this.http.create<any>('users/auth/session', token as any);
    }

    isAuthenticated(): boolean {
        return !!this.currentUserSubject.value;
    }

    getUser(): LoginResponse | null {
        return this.currentUserSubject.value;
    }

    getToken(): string | null {
        return localStorage.getItem(this.TOKEN_KEY);
    }

    private saveSession(user: LoginResponse): void {
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        if (user.token) {
            localStorage.setItem(this.TOKEN_KEY, user.token);
        }
        this.currentUserSubject.next(user);
    }

    private getUserFromStorage(): LoginResponse | null {
        const userStr = localStorage.getItem(this.USER_KEY);
        if (userStr) {
            try {
                return JSON.parse(userStr);
            } catch {
                return null;
            }
        }
        return null;
    }
}
