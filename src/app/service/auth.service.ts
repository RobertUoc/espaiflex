import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { config } from '../models/config';
import { Users } from '../models/users.model';
import { map, catchError } from 'rxjs/operators';
import { of, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  public apiUrl: string = config.url;
  private isAuthenticated = false;

  constructor( private http:HttpClient) { }

  login(username: string, password: string): Observable<boolean> {        
    return this.http.get<Users>(this.apiUrl + 'users.php?email=' + username + '&password=' + password + '&usuari=administrador').pipe(
      map((data) => {
        const isValid = !!data?.id;
        this.isAuthenticated = isValid;
        return isValid;
      }),
      catchError((error) => {
        console.error(error);
        this.isAuthenticated = false;
        return of(false); // Devuelve false en caso de error
      })
    );

  }

  logout(): void {
    this.isAuthenticated = false;
  }

  isLoggedIn(): boolean {
    return this.isAuthenticated;
  }
}