import { Component, OnInit, signal, ChangeDetectorRef } from '@angular/core';
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

@Component({
  selector: 'app-calendari',
  imports: [
    FormsModule,
    FullCalendarModule,
    NgIf,
    NgClass,
    CommonModule,
    PipePreuPipe,
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

  currentEvents = signal<EventApi[]>([]);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private changeDetector: ChangeDetectorRef,
    private userService: UsersService,
    private salesService: SalesService,
    private complementService: ComplementsService
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
    this.modalVisible[this.finestra] = true;
  }

  createEventId() {
    return String(this.eventGuid++);
  }

  handleDateSelect(selectInfo: DateSelectArg) {
    const title = prompt('Please enter a new title for your event');
    const calendarApi = selectInfo.view.calendar;

    calendarApi.unselect(); // clear date selection

    if (title) {
      calendarApi.addEvent({
        id: this.createEventId(),
        title,
        start: selectInfo.startStr,
        end: selectInfo.endStr,
        allDay: selectInfo.allDay,
      });
    }
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
