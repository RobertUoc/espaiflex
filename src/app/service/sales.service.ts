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

  private apiUrl = config.url + 'sales';
  private get_apiUrl = config.url + 'getsales';

  constructor(private http: HttpClient) {}

  getSales(): Observable<Sales[]> {    
    return this.http.get<Sales[]>(this.apiUrl);
  }

  getSala(id: number): Observable<Sales> {
    return this.http.get<Sales>(`${this.get_apiUrl}/versala/${id}`);
  }

  getSeleccionats(id_sala: number): Observable<Complements[]> {
    return this.http.get<Complements[]>(`${this.get_apiUrl}/vercomplements/${id_sala}`);
  }


  getByEdifici(id_edifici: number): Observable<Sales[]> {    
    return this.http.get<Sales[]>(`${this.get_apiUrl}/edifici/${id_edifici}`);
  }

  getDisponibles(id_sala: number): Observable<Complements[]> {
    return this.http.get<Complements[]>(
      `${this.apiUrl}?disponibles=${id_sala}`
    );
  }


  insertSala(sala: Sales, complements: number[]) {

    return this.http.post(this.apiUrl, {
      ...sala,
      id_edifici: Number(sala.id_edifici),
      complements: complements
    });
  }

  updateSala(id: number, sala: Sales, complements: number[]) {

    return this.http.put(`${this.apiUrl}/${id}`, {
      ...sala,
      id_edifici: Number(sala.id_edifici),
      complements: complements
    });
  }

}