import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { config } from '../models/config';
import { Observable } from 'rxjs';
import { Complements } from '../models/complements.model';

@Injectable({
  providedIn: 'root'
})
export class ComplementsService {
    public apiUrl: string = config.url;

    constructor( private http:HttpClient) { }

    // GET Leeer
    // POST guardar
    // PUT actulatzar
    // DELETE borrar

    getComplements(): Observable<Complements[]>  {
      return this.http.get<Complements[]>( this.apiUrl + 'complements.php');      
    }

    getComplement(id:string): Observable<Complements> {
      return this.http.get<Complements>( this.apiUrl + 'complements.php?id=' + id);      
    }

    putComplement(_id:string,_descripcio:string,_preu:number,_actiu:string) {      
      return this.http.put(this.apiUrl + 'complements.php', {
        id: _id,        
        descripcio: _descripcio,
        preu: _preu,
        actiu: _actiu,        
      });
    }
    
    insertComplement(_descripcio:string,_preu:number,_actiu:string) {
      return this.http.post(this.apiUrl + 'complements.php', {                  
        descripcio: _descripcio,
        preu: _preu,
        actiu: _actiu
      });     
    }
    
}
