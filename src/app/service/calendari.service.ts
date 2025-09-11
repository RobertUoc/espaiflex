import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { config } from '../models/config';
import { Horas } from '../models/horas.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})

export class CalendariService {
  public apiUrl: string = config.url;

  constructor(private http: HttpClient) {}

  // GET Leeer
  // POST guardar
  // PUT actulatzar
  // DELETE borrar

  getMira(dia: string, edifici: string): Observable<Horas[]> {    
    return this.http.get<Horas[]>(
      this.apiUrl + 'calendari.php?dia=' + dia + '&edifici=' + edifici
    );
  }
}
