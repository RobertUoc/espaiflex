import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { config } from '../models/config';
import { Observable } from 'rxjs';
import { Users } from '../models/users.model';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
    public apiUrl: string = config.url + 'users';

    constructor( private http:HttpClient) { }

    // GET Leeer
    // POST guardar
    // PUT actulatzar
    // DELETE borrar
    
    putUser(user: Users): Observable<any> {
       return this.http.put(this.apiUrl + '/' + user.id, {
          name: user.name,
          email: user.email,
          password: user.password,
          role: 'user'
        });
    }
    
    insertUser(user: Users): Observable<any> {
      return this.http.post(this.apiUrl, {
          name: user.name,
          email: user.email,
          password: user.password,
          role: 'user'
      });     
    }
    
}
