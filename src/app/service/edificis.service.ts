import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { config } from '../models/config';
import { Observable } from 'rxjs';
import { Edificis } from '../models/edificis.model';

@Injectable({
  providedIn: 'root'
})
export class EdificisService {
    public apiUrl: string = config.url + 'edificis';
    private tokenApi: string = config.token;

    constructor( private http:HttpClient) { }

    // GET Leeer
    // POST guardar
    // PUT actulatzar    

    getEdificis(): Observable<Edificis[]> {
      return this.http.get<Edificis[]>(`${this.apiUrl}`);
    }

    // GET: Un edificio por ID
    getEdifici(id: string): Observable<Edificis> {
      // Laravel prefiere /edificis/1, pero si quieres usar query params (?id=1) 
      // se hace así para que coincida con tu controlador actual:
      const params = new HttpParams().set('id', id);
      return this.http.get<Edificis>(`${this.apiUrl}`, {         
        params: params 
      });
    }

    // GET: Filtrar por provincia
    getProvincies(nombreProvincia: string): Observable<Edificis[]> {
      const params = new HttpParams().set('provincia', nombreProvincia);
      return this.http.get<Edificis[]>(`${this.apiUrl}`, {         
        params: params 
      });
    }

    // POST: Insertar (Laravel usa la ruta base con método POST)
    insertEdifici(edifici: any): Observable<any> {     
      console.log(edifici); 
      return this.http.post(`${this.apiUrl}`, edifici);
    }

    // PUT: Actualizar (Laravel usa /edificis/{id} con método PUT)
    putEdifici(id: string, edifici: any): Observable<any> {
      return this.http.put(`${this.apiUrl}/${id}`, edifici);
    }
    
}
