import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { config } from '../models/config';
import { Observable } from 'rxjs';
import { Provincia } from '../models/provincia.model';

@Injectable({
  providedIn: 'root'
})
export class ProvinciesService {
    public apiUrl: string = config.url;

    constructor( private http:HttpClient) { }

    // GET Leeer
    // POST guardar
    // PUT actulatzar
    // DELETE borrar

    getProvincies(): Observable<Provincia[]>  {
      return this.http.get<Provincia[]>( this.apiUrl + 'provincies.php');      
    }

    getProvincia(id:string): Observable<Provincia> {
      return this.http.get<Provincia>( this.apiUrl + 'proivincia.php?id=' + id);      
    }

}
