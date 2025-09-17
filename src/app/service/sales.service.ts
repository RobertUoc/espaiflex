import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { config } from '../models/config';
import { Observable } from 'rxjs';
import { Sales } from '../models/sales.model';
import { Complements } from '../models/complements.model';

@Injectable({
  providedIn: 'root',
})
export class SalesService {
  public apiUrl: string = config.url;

  constructor(private http: HttpClient) {}

  // GET Leeer
  // POST guardar
  // PUT actulatzar
  // DELETE borrar

  getSales(): Observable<Sales[]> {
    return this.http.get<Sales[]>(this.apiUrl + 'sales.php');
  }

  getSala(id: string): Observable<Sales> {
    return this.http.get<Sales>(this.apiUrl + 'sales.php?id=' + id);
  }

  getEdifici(id_edifici: string): Observable<Sales[]> {
    return this.http.get<Sales[]>(
      this.apiUrl + 'sales.php?edifici=' + id_edifici
    );
  }

  getDisponibles(id_sala: string): Observable<Complements[]> {
    return this.http.get<Complements[]>(
      this.apiUrl + 'sales.php?disponibles=' + id_sala
    );
  }

  getSeleccionats(id_sala: string): Observable<Complements[]> {
    return this.http.get<Complements[]>(
      this.apiUrl + 'sales.php?seleccionats=' + id_sala
    );
  }

  putSala(
    _id: string,
    _descripcio: string,
    _idedifici: string,
    _preu: number,
    _color: string,
    _missatge: string,
    _actiu: string,
    _max_ocupacio: string,
    _horari: string,
    _complement: string,    
  ) {    
    return this.http.put(this.apiUrl + 'sales.php', {      
      descripcio: _descripcio,
      idedifici: _idedifici,
      preu: _preu,
      color: _color,
      missatge: _missatge,      
      max_ocupacio: _max_ocupacio,
      actiu: _actiu,
      horari: _horari,
      complement: _complement,  
      id: _id,    
    });
  }

  insertSala(
    _descripcio: string,
    _idedifici: string,
    _preu: number,
    _color: string,
    _missatge: string,
    _actiu: string,
    _max_ocupacio: string,
    _horari: string,
    _complement: string,    
  ) {
    return this.http.post(this.apiUrl + 'sales.php', {
      descripcio: _descripcio,
      idedifici: _idedifici,
      preu: _preu,
      color: _color,
      missatge: _missatge,
      actiu: _actiu,
      max_ocupacio: _max_ocupacio,
      horari : _horari,
      complement: _complement,      
    });
  }
}
