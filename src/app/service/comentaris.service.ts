import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { config } from '../models/config';
import { Observable } from 'rxjs';
import { Comentaris } from '../models/comentaris.model';

@Injectable({
  providedIn: 'root',
})
export class ComentariService {
  public apiUrl: string = config.url+'comentaris';

  constructor(private http: HttpClient) {}

  // GET Leeer
  // POST guardar
  // PUT actulatzar
  // DELETE borrar

  getComentarios(): Observable<Comentaris[]> {
    return this.http.get<Comentaris[]>(this.apiUrl);
  }
  

  insertComentari(
      id_reserves: string,
      id_user: number,
      comentari: string,
      puntuacio: number,
      nom:string
    ) {
      return this.http.post(this.apiUrl, {
        id_reserves,
        id_user,
        comentari,
        puntuacio, 
        nom
      });
  }

}
