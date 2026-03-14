import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { config } from '../models/config';
import { Observable } from 'rxjs';
import { Provincia } from '../models/provincia.model';

@Injectable({
  providedIn: 'root'
})
export class ProvinciesService {

  private apiUrl = config.url + 'provincies';

  constructor(private http: HttpClient) {}

  // GET todas
  getProvincies(): Observable<Provincia[]> {
    return this.http.get<Provincia[]>(this.apiUrl);
  }

  // GET una por id
  getProvincia(id: number): Observable<Provincia> {
    return this.http.get<Provincia>(`${this.apiUrl}/${id}`);
  }

}