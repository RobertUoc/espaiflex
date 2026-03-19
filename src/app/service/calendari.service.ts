import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { config } from '../models/config';
import { Horas } from '../models/horas.model';
import { Calendario } from '../models/calendario.model.';
import { Reserva } from '../models/reserva.model';
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
    _frecuencia: string,
    _diesSeleccionats: string,
    _seleccio_mensual: string,
    _dia_seleccionado: number,
    _El1: string,
    _El2: string,
    _import: number,
    _id_user: number,
    _horasAgrupadas: string,
    _complements: string
  ): Observable<Calendario[]> {
    return this.http.post<Calendario[]>(this.apiUrl , {
      sala: _sala,
      dia_inici: _dia_inici,
      dia_fi: _dia_fi,
      frecuencia: _frecuencia,
      diesSeleccionats: _diesSeleccionats,
      seleccio_mensual: _seleccio_mensual,
      dia_seleccionado: _dia_seleccionado,
      el_semana: _El1,
      el_dia: _El2,
      import: _import,
      id_user: _id_user,
      horasAgrupadas: _horasAgrupadas,
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

  deleteEvent(id_event: string) {
    return this.http.get(
      this.apiUrl + 'delete_event/' + id_event
    );
  }
}
