import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { config } from '../models/config';
import { Observable } from 'rxjs';
import { Edificis } from '../models/edificis.model';

@Injectable({
  providedIn: 'root'
})
export class EdificisService {
    public apiUrl: string = config.url;

    constructor( private http:HttpClient) { }

    // GET Leeer
    // POST guardar
    // PUT actulatzar
    // DELETE borrar

    getEdificis(): Observable<Edificis[]>  {
      return this.http.get<Edificis[]>( this.apiUrl + 'edificis.php');      
    }

    getEdifici(id:string): Observable<Edificis> {
      console.log(this.apiUrl + 'edificis.php?id=' + id);
      return this.http.get<Edificis>( this.apiUrl + 'edificis.php?id=' + id);      
    }

    getProvincies(id:string): Observable<[]> {      
      return this.http.get<[]>( this.apiUrl + 'edificis.php?provincia=' + id);            
    }

    putEdifici(_id:string,_nom:string,_id_provincia:string,_imatge:string,_descripcio:string,_actiu:string) {      
      return this.http.put(this.apiUrl + 'edificis.php', {
        id: _id,
        nom: _nom,
        idprovincia: _id_provincia,        
        imatge: _imatge,
        descripcio: _descripcio,
        actiu: _actiu,        
      });
    }
    
    insertEdifici(_nom:string,_id_provincia:string,_imatge:string,_descripcio:string,_actiu:string) {
      return this.http.post(this.apiUrl + 'edificis.php', {
        nom: _nom,
        idprovincia: _id_provincia,
        imatge: _imatge,
        descripcio: _descripcio,
        actiu: _actiu
      });     
    }
    
}
