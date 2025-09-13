import { Component, OnInit, signal, ChangeDetectorRef, QueryList, ViewChildren, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FullCalendarModule } from '@fullcalendar/angular';
import {
  CalendarOptions,
  DateSelectArg,
  EventClickArg,
  EventApi,
} from '@fullcalendar/core';
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import { CommonModule, NgClass, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Users } from '../../models/users.model';
import { Sales } from '../../models/sales.model';
import { Complements } from '../../models/complements.model';
import { UsersService } from '../../service/users.service';
import { SalesService } from '../../service/sales.service';
import { ComplementsService } from '../../service/complements.service';
import { PipePreuPipe } from '../../pipe/pipePreu.pipe';
import { PipeFechaPipe } from '../../pipe/pipeFecha.pipe';
import { CalendariService } from '../../service/calendari.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-calendari',
  imports: [
    FormsModule,
    FullCalendarModule,
    NgIf,
    NgClass,
    CommonModule,
    PipePreuPipe,
    PipeFechaPipe,
  ],
  templateUrl: './calendari.component.html',
  styleUrls: ['./calendari.component.css'],
})
export class CalendariComponent implements OnInit {
  loginData = {
    email: '',
    password: '',
  };

  public modalVisible = [false];
  public registerData = new Users();
  public eventGuid: number = 0;
  public usuari: string = 'Visitant';
  public id_usuari: number = 0;
  public finestra: number = 0;
  public sales = [new Sales()];
  public salaSeleccionado = new Sales();
  public complements = [new Complements()];
  public dia: string = '';
  public mira_dia: any[] = [];
  public horas: string[] = [];
  public data_reserva: string = '';
  public sala_reserva: string = '';
  public mostrarHourGrid: boolean = false;
  public mostrarPeu: boolean = false;
  public agrupado: { [key: string]: { hora_inici: string; estado: string }[]; } = {};
  public preu_sala : number = 0;
  public preu_sala_total: number = 0;

  id_edifici: string = '';
  calendarVisible = signal(true);
  calendarOptions = signal<CalendarOptions>({
    plugins: [interactionPlugin, dayGridPlugin, timeGridPlugin],
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
    },
    initialView: 'dayGridMonth',
    weekends: true,
    editable: true,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    select: this.handleDateSelect.bind(this),
    eventClick: this.handleEventClick.bind(this),
    eventsSet: this.handleEvents.bind(this),
  });

   @ViewChildren('horesSelected') botones!: QueryList<ElementRef>;

  currentEvents = signal<EventApi[]>([]);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private changeDetector: ChangeDetectorRef,
    private userService: UsersService,
    private salesService: SalesService,
    private complementService: ComplementsService,
    private calendariService: CalendariService
  ) {}

  ngOnInit() {
    this.id_edifici = this.route.snapshot.paramMap.get('id') || '';
    this.getSales(this.id_edifici);
  }

  getSales(id_edifici: string) {
    this.salesService.getEdifici(this.id_edifici).subscribe({
      next: (data) => {
        this.sales = data;
      },
      error: (error) => {
        console.log(error);
      },
      complete: () => {
        console.log('Ok');
      },
    });
  }

  getSala(id_sala: string) {
    this.salesService.getSala(id_sala).subscribe({
      next: (data) => {
        this.salaSeleccionado = new Sales(
          data.id,
          data.descripcio,
          data.id_edifici,
          data.nom_edifici,
          data.preu,
          data.actiu,
          data.color,
          data.missatge
        );
      },
      error: (error) => {
        console.log(error);
      },
      complete: () => {
        // Seleccionats
        this.salesService.getSeleccionats(id_sala).subscribe({
          next: (data) => {
            this.complements = data;
          },
          error: (error) => {
            console.log(error);
          },
        });
        console.log('Ok');
      },
    });
    this.finestra = 99;
    this.modalVisible[this.finestra] = true;
  }

  tornar() {
    this.router.navigate(['/']);
  }

  onLoginSubmit() {
    this.tancarModal();
    this.id_usuari = 0;
    this.usuari = 'Visitant';
    this.userService
      .getUser(this.loginData.email, this.loginData.password)
      .subscribe({
        next: (data) => {
          if (data && data.id) {
            this.id_usuari = parseInt(data.id);
            this.usuari = data.nom;
            this.registerData = new Users(
              data.id,
              data.nom,
              data.email,
              data.password,
              data.password
            );
          }
        },
        error: (error) => {
          console.log(error);
        },
        complete: () => {
          console.log('Ok');
        },
      });
  }

  tancarModal() {
    this.modalVisible[this.finestra] = false;
  }

  neteja(neteja: number) {
    this.finestra = neteja;
    if (neteja < 3) {
      this.registerData = new Users();
    }
    this.modalVisible[this.finestra] = true;
  }

  onRegisterSubmit() {
    // Insert
    console.log('ALTA');
    if (this.registerData.id == '0') {
      this.userService
        .insertUser(
          this.registerData.nom,
          this.registerData.email,
          this.registerData.password
        )
        .subscribe((response) => {});
    } else {
      this.userService
        .putUser(
          this.registerData.id,
          this.registerData.nom,
          this.registerData.email,
          this.registerData.password
        )
        .subscribe((response) => {
          console.log(response);
        });
      this.usuari = this.registerData.nom;
    }
    this.tancarModal();
  }

  passwordsMatch(): boolean {
    return this.registerData.password === this.registerData.confirm
      ? true
      : false;
  }

  reserva() {
    this.finestra = 90;
    this.mostrarHourGrid = false;
    this.mostrarPeu = false;
    this.agrupado = {};        
    this.modalVisible[this.finestra] = true;
    this.data_reserva = new Date().toISOString().substring(0, 10);
    this.sala_reserva = '0';
  }

  generate() {
    let uri_sala = this.sala_reserva;
    let fecha = this.data_reserva;
    // Miro les hores d'aquesta Sala.
    this.mostrarHourGrid = false;
    this.mostrarPeu = false;
    this.agrupado = {};    
    if (uri_sala == '0') {

      Swal.fire({
          title: 'Atenció!!!',
          text: "No s'ha seleccionat cap sala.",
          icon: 'success',
          confirmButtonText: 'Aceptar'
      });

    } else {


      const preus_sales = this.sales.find(item =>item.id == uri_sala);
      this.preu_sala = preus_sales ? preus_sales.preu : 0;
      this.preu_sala_total = 0;

    this.calendariService.getMiraDia(fecha, uri_sala).subscribe({
      next: (data) => {
        this.agrupado = {};
        let compara = '0';        
        data.forEach((item) => {
          if (!this.agrupado[item.descripcio]) {
            this.agrupado[item.descripcio] = [];
            compara = '0';
          }
          // Crear Capcelera
          compara = this.CrearBotons(item,compara);
        });
        this.horas = this.horas.sort();
        this.mira_dia = Object.entries(this.agrupado).map(([id, items]) => ({
          id,
          items,
        }));
      },
      error: (error) => {
        console.log(error);
      },
      complete: () => {
        this.mostrarHourGrid = true;      
        console.log('Ok');
      },
    });

    }
  }

  triaHora(event: Event) {
      this.mostrarPeu = false;
      const boton = event.target as HTMLElement;
      
      if (boton.classList.contains('bg-warning')) {
        boton.classList.remove('bg-warning');
        boton.classList.add('bg-success');
      } else {
        boton.classList.remove('bg-success');
        boton.classList.add('bg-warning');
      }
      
      const btn = this.botones.toArray();
      const hihabtn = btn.filter(boton => boton.nativeElement.classList.contains('bg-warning')).length;
      if (hihabtn > 0) {
        this.mostrarPeu = true;
        this.preu_sala_total = (this.preu_sala * hihabtn);
        console.log(this.preu_sala);
      }      

  }

  createEventId() {
    return String(this.eventGuid++);
  }

  CrearBotons(item:any, compara:string):string {
        let horaStr = [];
        let horaInicio = 0;
        let horaFin = 0;
        let horaFinal = '';
        //
        let inici = '0';

          horaStr = item.hora_inici.split(':');
          horaInicio = Number(horaStr[0]);
          horaFin = horaInicio + 1;
          horaFinal =
            horaInicio.toString().padStart(2, '0') +
            ' a ' +
            horaFin.toString().padStart(2, '0');
          if (!this.horas.includes(horaFinal)) {
            this.horas.push(horaFinal);
          }
          inici = horaFinal.substring(0, 2);
          if (item.estado != 'No informado') {
            compara = item.estado.substring(0, 2);
          }
          if (inici < compara) {
            item.estado = compara;
          }
          this.agrupado[item.descripcio].push({
            hora_inici: horaFinal,
            estado: item.estado,
          });

          return compara
  }

  handleDateSelect(selectInfo: DateSelectArg) {
    this.dia = selectInfo.startStr;

    this.calendariService.getMira(this.dia, this.id_edifici).subscribe({
      next: (data) => {
        this.agrupado = {};
        let compara = '0';        
        data.forEach((item) => {
          if (!this.agrupado[item.descripcio]) {
            this.agrupado[item.descripcio] = [];
            compara = '0';
          }
          // Crear Capcelera
          compara = this.CrearBotons(item,compara);
        });
        this.horas = this.horas.sort();
        this.mira_dia = Object.entries(this.agrupado).map(([id, items]) => ({
          id,
          items,
        }));
      },
      error: (error) => {
        console.log(error);
      },
      complete: () => {
        console.log('Ok');
      },
    });

    const calendarApi = selectInfo.view.calendar;
    calendarApi.unselect(); // clear date selection

    this.finestra = 80;
    this.modalVisible[this.finestra] = true;

    /**
    if (title) {
      calendarApi.addEvent({
        id: this.createEventId(),
        title,
        start: selectInfo.startStr,
        end: selectInfo.endStr,
        allDay: selectInfo.allDay,
      });
    }
  */
  }
  handleEventClick(clickInfo: EventClickArg) {
    if (
      confirm(
        `Are you sure you want to delete the event '${clickInfo.event.title}'`
      )
    ) {
      clickInfo.event.remove();
    }
  }

  handleEvents(events: EventApi[]) {
    this.currentEvents.set(events);
    this.changeDetector.detectChanges(); // workaround for pressionChangedAfterItHasBeenCheckedError
  }
}
