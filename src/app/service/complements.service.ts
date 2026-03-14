import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { config } from '../models/config';
import { Observable } from 'rxjs';
import { Complements } from '../models/complements.model';

@Injectable({
  providedIn: 'root'
})
export class ComplementsService {

  private apiUrl = config.url + 'complements';

  constructor(private http: HttpClient) {}

  // GET todos
  getComplements(): Observable<Complements[]> {
    return this.http.get<Complements[]>(this.apiUrl);
  }

  // GET uno por id
  getComplement(id: number): Observable<Complements> {
    return this.http.get<Complements>(`${this.apiUrl}?id=${id}`);
  }

  // POST crear
  insertComplement(data: {
    descripcio: string;
    preu: number;
    actiu: string;
  }): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  // PUT actualizar
  updateComplement(id: string, data: {
    descripcio: string;
    preu: number;
    actiu: string;
  }): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

}