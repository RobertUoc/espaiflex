import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { config } from '../models/config';
import { Horas } from '../models/horas.model';
import { Calendario } from '../models/calendario.model.';
import { Reserva } from '../models/reserva.model';
import { InsertEvent } from '../models/insertEvent.model';
import { ErrorEvent } from '../models/errorEvent.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CalendariService {
  public apiUrl: string = config.url + 'reserves/';

  constructor(private http: HttpClient) {}

  // GET Leeer
  // POST guardar
  // PUT actulatzar
  // DELETE borrar

  getCarga(any: string, edificio: number): Observable<Calendario[]> {
    return this.http.get<Calendario[]>(
      this.apiUrl + 'any/' + any + '/edifici/' + edificio
    );
  }

  getMira(dia: string, edifici: number): Observable<Horas[]> {
    return this.http.get<Horas[]>(
      this.apiUrl + 'dia/' + dia + '/edifici/' + edifici
    );
  }
  
  getMiraDia(dia: string, sala: number): Observable<Horas[]> {
    return this.http.get<Horas[]>(
      this.apiUrl + 'dia/' + dia + '/sala/' + sala
    );
  }
  
  getDadesReserva(id: string): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(
      this.apiUrl + 'reserva/' + id
    );
  }

  getMiraReserva(
    dia: string,
    sala: number,
    reserva: number
  ): Observable<Horas[]> {
    return this.http.get<Horas[]>(
      this.apiUrl + 'dia/' + dia + '/sala/' + sala + '/reserva/' +  reserva
    );
  }

  getDia(id: string): Observable<Calendario> {
    return this.http.get<Calendario>(this.apiUrl + 'reserva/' + id);
  }

  insertEvent(
    _sala: string,
    _dia_inici: string,
    _dia_fi: string,
    _hora_inici: string,
    _hora_fi: string,
    _import: number,
    _id_user: number,
    _frecuencia: string,
    _dom: number,
    _lun: number,
    _mar: number,
    _mie: number,
    _jue: number,
    _vie: number,
    _sab: number,
    _tipo: number,
    _dia_mes: number,
    _el_semana: string,
    _el_dia: string,
    _complements: string
  ): Observable<InsertEvent> {
    return this.http.post<InsertEvent>(this.apiUrl , {
      sala: _sala,
      dia_inici: _dia_inici,
      dia_fi: _dia_fi,
      hora_inici: _hora_inici,
      hora_fi: _hora_fi,
      import: _import,
      id_user: _id_user,
      frecuencia: _frecuencia,
      dom: _dom,
      lun: _lun,
      mar: _mar,
      mie: _mie,
      jue: _jue,
      vie: _vie,
      sab: _sab,
      tipo: _tipo,
      dia_mes: _dia_mes,
      el_semana: _el_semana,
      el_dia: _el_dia,
      complements: _complements,
    });
  }

  buscarInsertDia(
    _sala: number,
    _dia_inici: string,
    _dia_fi: string,
    _frecuencia: string,
    _hora_inici: string,
    _hora_fi: string
  ): Observable<ErrorEvent[]> {
    return this.http.get<ErrorEvent[]>(
      this.apiUrl + 'buscarSala/sala/' + _sala + '/diainici/' + _dia_inici + '/diafi/' + _dia_fi + '/horainici/' + _hora_inici + '/horafi/' + _hora_fi
    );
  }

  grabaFactura(
    _reserva: number,    
    _fecha: string,
    _base: number,
    _iva: number,
    _iva_importe: number,
    _total: number
  ) {
    return this.http.put(this.apiUrl + 'factura', {
      id_reserva: _reserva,      
      data_factura: _fecha,
      base: _base,
      iva: _iva,
      iva_import: _iva_importe,
      total_factura: _total,
    });
  }

  deleteEvent(id_event: string) {
    return this.http.get(
      this.apiUrl + 'delete_event/' + id_event
    );
  }
}
