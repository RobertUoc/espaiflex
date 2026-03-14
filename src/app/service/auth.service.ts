import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { config } from '../models/config';
import { map, catchError } from 'rxjs/operators';
import { of, Observable } from 'rxjs';

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    created_at?: string;
    updated_at?: string;
  };
}

@Injectable({ providedIn: 'root' })

export class AuthService {
  public apiUrl: string = config.url;
  private isAuthenticated = false;

  constructor( private http:HttpClient) { }
  
  login(email: string, password: string): Observable<boolean> {
    return this.http.post<any>(this.apiUrl + 'login', {
      email: email,
      password: password      
    }).pipe(
      map(response => {
        if (response?.token) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('role', response.user.role);
          localStorage.setItem('id', response.user.id);         
          localStorage.setItem('user', response.user);     
          this.isAuthenticated = true;
          return true;
        }
        return false;
      }),
      catchError(error => {        
        this.isAuthenticated = false;
        return of(false);
      })
    );
  }

  loginUser(email: string, password: string) {
    return this.http.post<LoginResponse>(this.apiUrl + 'login', {
      email,
      password      
    });
  }


  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    this.isAuthenticated = false;
  }

  isLoggedIn(): boolean {     
    return this.isAuthenticated;
  }
}