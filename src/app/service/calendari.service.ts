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

  getMiraDia(dia: string, sala: string): Observable<Horas[]> {
    return this.http.get<Horas[]>(
      this.apiUrl + 'calendari.php?dia=' + dia + '&sala=' + sala
    );
  }

  getMiraReserva(
    dia: string,
    sala: string,
    reserva: string
  ): Observable<Horas[]> {
    return this.http.get<Horas[]>(
      this.apiUrl +
        'calendari.php?dia=' +
        dia +
        '&sala=' +
        sala +
        '&reserva=' +
        reserva
    );
  }

  getCarga(any: string, edificio: string): Observable<Calendario[]> {
    return this.http.get<Calendario[]>(
      this.apiUrl + 'calendari.php?any=' + any + '&edifici=' + edificio
    );
  }

  getDia(id: string): Observable<Calendario> {
    return this.http.get<Calendario>(this.apiUrl + 'calendari.php?id=' + id);
  }

  getDadesReserva(id: string): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(
      this.apiUrl + 'calendari.php?reserva=' + id
    );
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
    return this.http.post<InsertEvent>(this.apiUrl + 'calendari.php', {
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
    _sala: string,
    _dia_inici: string,
    _dia_fi: string,
    _frecuencia: string,
    _hora_inici: string,
    _hora_fi: string
  ): Observable<ErrorEvent[]> {
    return this.http.get<ErrorEvent[]>(
      this.apiUrl +
        'calendari.php?buscarSala=' +
        _sala +
        '&diaInici=' +
        _dia_inici +
        '&diaFi=' +
        _dia_fi +
        '&horaInici=' +
        _hora_inici +
        '&horaFi=' +
        _hora_fi
    );
  }

  grabaFactura(
    _usuari: number,
    _fecha: string,
    _base: number,
    _iva: number,
    _iva_importe: number,
    _total: number
  ) {
    return this.http.put(this.apiUrl + 'calendari.php', {
      usuario: _usuari,
      fecha: _fecha,
      base: _base,
      iva: _iva,
      iva_importe: _iva_importe,
      total: _total,
    });
  }

  deleteEvent(id_event: string) {
    return this.http.get(
      this.apiUrl + 'calendari.php?delete_event=' + id_event
    );
  }
}
