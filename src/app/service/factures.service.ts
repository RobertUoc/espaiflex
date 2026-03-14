import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { FacturaMes } from '../models/factura.model';
import { FacturaDia } from '../models/factura.model';
import { Factures } from '../models/factura.model';
import { config } from '../models/config';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })

export class FacturesService {

  apiUrl = config.url + 'factures';

  constructor(private http: HttpClient) {}

  // GET todos
  getFactures(): Observable<Factures[]> {
    return this.http.get<Factures[]>(this.apiUrl);
  }

  getMeses(): Observable<FacturaMes[]> {
    return this.http.get<FacturaMes[]>(this.apiUrl);
  }

  getAnios() {
    return this.http.get<number[]>(this.apiUrl + '/anios');
  }

  getFacturacionPorMes(anio: number) {    
    return this.http.get<FacturaMes[]>(`${this.apiUrl}/meses/${anio}`);
  }

  getFacturacionPorDia(anio: number, mes: number) {
    return this.http.get<FacturaDia[]>(`${this.apiUrl}/dias/${anio}/${mes}`);
  }  

  getFactura(id: number) {
    return this.http.get<Factures>(`${this.apiUrl}/${id}`);
  }

  enviarFacturaEmail(id: number) {
    return this.http.post(`${this.apiUrl}/${id}/email`, {}
  );
}

}