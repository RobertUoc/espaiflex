import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { config } from '../models/config';
import { Observable } from 'rxjs';
import { Users } from '../models/users.model';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
    public apiUrl: string = config.url;

    constructor( private http:HttpClient) { }

    // GET Leeer
    // POST guardar
    // PUT actulatzar
    // DELETE borrar

    getUsers(): Observable<Users[]>  {
      return this.http.get<Users[]>( this.apiUrl + 'users.php');      
    }

    getUser(email:string,password:string,tipus:string): Observable<Users> {
      return this.http.get<Users>( this.apiUrl + 'users.php?email=' + email + '&password=' + password + '&usuari=' + tipus);      
    }

    putUser(_id:string,_nom:string,_email:string,_password:string) {      
      return this.http.put(this.apiUrl + 'users.php', {
        id: _id,        
        nom: _nom,
        email: _email,
        password: _password
      });
    }
    
    insertUser(_nom:string,_email:string,_password:string) {      
      return this.http.post(this.apiUrl + 'users.php', {                  
        nom: _nom,
        email: _email,
        password: _password
      });     
    }
    
}
