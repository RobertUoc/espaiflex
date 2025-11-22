import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { config } from '../models/config';
import { Observable } from 'rxjs';
import { Comentaris } from '../models/comentaris.model';

@Injectable({
  providedIn: 'root',
})
export class ComentariService {
  public apiUrl: string = config.url;

  constructor(private http: HttpClient) {}

  // GET Leeer
  // POST guardar
  // PUT actulatzar
  // DELETE borrar

  getComentarios(): Observable<Comentaris[]> {
    return this.http.get<Comentaris[]>(this.apiUrl + 'comentaris.php');
  }

  insertComentari(
    _id_reserves: string,
    _id_user: number,
    _comentari: string,
    _puntuacio: string
  ) {
    return this.http.post(this.apiUrl + 'comentaris.php', {
      id_reserves: _id_reserves,
      id_user: _id_user,
      comentari: _comentari,
      puntacio: _puntuacio,
    });
  }
}
