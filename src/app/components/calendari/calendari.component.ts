import {
  Component,
  OnInit,
  signal,
  computed,
  ChangeDetectorRef,
  QueryList,
  ViewChildren,
  ElementRef,
} from '@angular/core';
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
import { Horas } from '../../models/horas.model';
import { Reserva } from '../../models/reserva.model';
import { Complements } from '../../models/complements.model';
import { UsersService } from '../../service/users.service';
import { SalesService } from '../../service/sales.service';
import { ComplementsService } from '../../service/complements.service';
import { PipePreuPipe } from '../../pipe/pipePreu.pipe';
import { PipeFechaPipe } from '../../pipe/pipeFecha.pipe';
import { CalendariService } from '../../service/calendari.service';
import Swal from 'sweetalert2';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

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
    ReactiveFormsModule,
  ],
  templateUrl: './calendari.component.html',
  styleUrls: ['./calendari.component.css'],
})
export class CalendariComponent implements OnInit {
  loginData = {
    email: '',
    password: '',
  };
  private TODAY_STR = new Date().toISOString().replace(/T.*$/, ''); // Avui
  public modalVisible = [false];
  public registerData = new Users();
  public eventGuid: number = 0;
  public usuari: string = 'Visitante';
  public id_usuari: number = 0;
  public finestra: number = 0;
  public sales = [new Sales()];
  public reservas = [new Reserva()];
  public salaSeleccionado = new Sales();
  public complements = [new Complements()];
  public dia: string = '';
  public mira_dia: any[] = [];
  public horas: string[] = [];
  // Formulario Reserva
  public reservaForm!: FormGroup;

  public data_reserva_ini: string = '';
  public data_reserva_fin: string = '';
  public frecuencia: string = "diaria";
  public sala_reserva: string = '';
  public missatge: string = '';
  public max_sala: string = '1';
  public mostrarHourGrid: boolean = false;
  public mostrarPeu: boolean = false;
  public agrupado: { [key: string]: { hora_inici: string; estado: string }[] } = {};
  public preu_sala: number = 0;
  public preu_sala_total: number = 0;
  public horari: string = '1';
  public selectedComplements: number[] = [];
  public eventos = signal([
    {
      id: '',
      title: '',
      groupId: '',
      start: '',
      end: '',          
      backgroundColor: '',
      borderColor: '',
      textColor: '',      
      allDay: false,
    },
  ]);
  public alta_reserva: string = '0';
  getInSiteForm: any;

  id_edifici: string = '';

  calendarVisible = signal(true);
  calendarOptions = computed(
    (): CalendarOptions => ({
      plugins: [interactionPlugin, dayGridPlugin, timeGridPlugin],
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
      },
      initialView: 'dayGridMonth',
      events: this.eventos(),
      locale: 'ca',
      weekends: true,
      editable: true,
      selectable: true,
      selectMirror: true,
      dayMaxEvents: true,
      select: this.handleDateSelect.bind(this),
      eventClick: this.handleEventClick.bind(this),
      eventsSet: this.handleEvents.bind(this),
    })
  );

  @ViewChildren('horesSelected') botones!: QueryList<ElementRef>;
  @ViewChildren('checkComplemento') checkboxes!: QueryList<ElementRef>;

  currentEvents = signal<EventApi[]>([]);

  constructor(
    private fb: FormBuilder,
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
    this.carregaDies();
    this.createForm();
  }

  createForm() {
    // Formulario Reserva
    this.reservaForm = this.fb.group({
      fechaInicial: [new Date().toISOString().substring(0, 10), [Validators.required, Validators.maxLength(10)]],
      fechaFinal: [new Date().toISOString().substring(0, 10), [Validators.required, Validators.maxLength(10)]],
      frecuencia: ['diaria'], // diaria | semanal | mensual
      diasSemana: this.fb.group({
        lunes: [false],
        martes: [false],
        miercoles: [false],
        jueves: [false],
        viernes: [false],
        sabado: [false],
        domingo: [false]
      }),
      mensualidad: this.fb.group({
        tipo : ['1'],
        numeroDia: ['1'],        
        periodo: ['primer'],
        diaSemana: ['lunes'],
      }),
      sala_reserva: ['', [Validators.required, Validators.maxLength(6)]],
      max_sala: [{ value: '', disabled: true}] ,
      horari_sala: [{ value: '', disabled: true}] ,
    })
  }

  actualizarMaximo() {
    let salaId = this.reservaForm.get('sala_reserva')?.value;
    let DadesSala = this.sales.find(reg => reg.id == salaId);
    // this.max_sala = DadesSala?.max_ocupacio ?? '';
    // this.horari_sala = DadesSala?.horari ?? '';
    this.missatge = DadesSala?.missatge ?? '';

    this.reservaForm.get('max_sala')?.setValue(DadesSala?.max_ocupacio ?? '');
    this.reservaForm.get('horari_sala')?.setValue(DadesSala?.horari ?? '');

    this.generate();

  }

  getSales(id_edifici: string) {
    this.salesService.getEdifici(id_edifici).subscribe({
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
          data.missatge,
          data.max_ocupacio,
          data.horari
        );
      },
      error: (error) => {
        console.log(error);
      },
      complete: () => {
        // Seleccionats
        this.getcomplent(id_sala);
        console.log('Ok');
      },
    });
    this.finestra = 99;
    this.modalVisible[this.finestra] = true;
  }

  getcomplent(id_sala: string) {
    this.salesService.getSeleccionats(id_sala).subscribe({
      next: (data) => {
        this.complements = data;
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  sumaComplement(clase: string) {
    let total = 0;
    let btn = this.botones.toArray();
    let hihabtn = btn.filter((boton) =>
      boton.nativeElement.classList.contains(clase)
    ).length;
    if (hihabtn > 0) {
      this.mostrarPeu = true;
      this.preu_sala_total = this.preu_sala * hihabtn;
      this.checkboxes.forEach((checkbox, i) => {
        if (checkbox.nativeElement.checked) {
          total += this.complements[i].preu;
        }
      });
    }
    this.preu_sala_total += total;
  }

  tornar() {
    this.router.navigate(['/']);
  }
  onLoginSubmit() {
    this.id_usuari = 0;
    this.usuari = 'Visitante';
    this.userService
      .getUser(this.loginData.email, this.loginData.password, 'usuari')
      .subscribe({
        next: (data) => {
          if (data?.id) {
            this.id_usuari = parseInt(data.id);
            this.usuari = data.nom;
            this.registerData = new Users(data.id, data.nom, data.email, data.password, data.password);
          }
        },
        error: (error) => {
          console.log(error);
        },
        complete: () => {
          this.tancarModal();
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
    this.selectedComplements = [];
    this.alta_reserva = '0';
    this.finestra = 90;
    this.mostrarHourGrid = false;
    this.mostrarPeu = false;
    this.agrupado = {};
    this.modalVisible[this.finestra] = true;
    this.data_reserva_ini = new Date().toISOString().substring(0, 10);
    this.data_reserva_fin = new Date().toISOString().substring(0, 10);
    this.sala_reserva = '0';
  }

  mostrarAlertes(
    title: string,
    text: string,
    icon: 'success' | 'error' | 'warning' | 'info',
    confirmText: string
  ): void {
    Swal.fire({
      title,
      text,
      icon,
      confirmButtonText: confirmText,
    });
  }

  resetGenerate() {
    this.mostrarHourGrid = false;
    this.mostrarPeu = false;
    this.agrupado = {};
    this.preu_sala_total = 0;
  }

  creaHorari(data: Horas[]) {
    // horari
    this.agrupado = {};
    let compara = '0';
    data.forEach((item) => {
      if (!this.agrupado[item.descripcio]) {
        this.agrupado[item.descripcio] = [];
        compara = '0';
      }
      // Crear Capcelera
      this.horari = item.tipus;
      compara = this.CrearBotons(item, compara);
    });
    this.horas = this.horas.sort();
    this.mira_dia = Object.entries(this.agrupado).map(([id, items]) => ({
      id,
      items,
    }));
  }

  generate() {
    this.resetGenerate();
    this.sala_reserva = this.reservaForm.get('sala_reserva')?.value;    
    if (this.sala_reserva == '0') {
      this.mostrarAlertes(
        'Atenció!!!',
        "No s'ha seleccionat cap sala.",
        'success',
        'Aceptar'
      );
      return;
    }
    //
    //
    this.calendariService
      .getMiraDia(this.data_reserva_ini, this.sala_reserva)
      .subscribe({
        next: (data) => {
          this.creaHorari(data);
        },
        error: (error) => {
          console.log(error);
        },
        complete: () => {
          // Busco els complements de la sala
          this.preu_sala =
            this.sales.find((item) => item.id == this.sala_reserva)?.preu ?? 0;
          this.getcomplent(this.sala_reserva);
          this.checkboxes.forEach((checkbox, i) => {});
          this.mostrarHourGrid = true;
          console.log('Ok');
        },
      });
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
    this.sumaComplement('bg-warning');
  }

  private calcularHoraFinal(horari: string, hora_inici: string): string {
    const [hora, minuto] = hora_inici.split(':');
    const horaNum = +hora;
    let horaFinal = `${hora.padStart(2, '0')} a ${(horaNum + 1)
      .toString()
      .padStart(2, '0')}`;
    if (horari == '2') {
      horaFinal =
        minuto === '00'
          ? `${hora}:00 a ${hora}:30`
          : `${hora}:${minuto} a ${(horaNum + 1)
              .toString()
              .padStart(2, '0')}:00`;
    }
    return horaFinal;
  }

  CrearBotons(item: any, compara: string): string {
    let horaStr = [];
    let horaInicio = 0;
    let horaFin = 0;
    let horaFinal = '';
    //
    let inici = '0';
    horaFinal = this.calcularHoraFinal(this.horari, item.hora_inici);
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
    return compara;
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
          compara = this.CrearBotons(item, compara);
        });
        this.horas = this.horas.sort();
        this.mira_dia = Object.entries(this.agrupado).map(([id, items]) => ({
          id,
          items,
        }));
      },
      error: (error) => { console.log(error); },
      complete: () => { console.log('Ok');  },
    });
    const calendarApi = selectInfo.view.calendar;
    calendarApi.unselect(); // clear date selection
    this.finestra = 80;
    this.modalVisible[this.finestra] = true;
  }

  handleEventClick(clickInfo: EventClickArg) {        
    this.finestra = 90;
    this.mostrarHourGrid = false;
    this.mostrarPeu = false;
    this.agrupado = {};
    this.modalVisible[this.finestra] = true;
    this.data_reserva_ini = clickInfo.event.startStr;
    this.resetGenerate();
    this.sala_reserva = clickInfo.event.groupId;
    this.alta_reserva = clickInfo.event.id;
    this.calendariService.getDadesReserva(clickInfo.event.id).subscribe({
      next: (data) => { this.reservas = data; },
      error: (error) => { console.log(error); },
      complete: () => {
        this.preu_sala_total = this.reservas[0]?.import_sala;
        this.max_sala = this.reservas[0]?.max_ocupacio;
        this.horari = this.reservas[0]?.horari;
        this.missatge = this.reservas[0].missatge;
        this.selectedComplements = [];
        this.selectedComplements = this.reservas.map((r) => +r.id_complements);
        console.log(this.selectedComplements);
      },
    });
    this.calendariService
      .getMiraReserva(this.data_reserva_ini, this.sala_reserva, clickInfo.event.id)
      .subscribe({
        next: (data) => { this.creaHorari(data); },
        error: (error) => { console.log(error);  },
        complete: () => {
          // Busco els complements de la sala
          this.preu_sala =
            this.sales.find((item) => item.id == this.sala_reserva)?.preu ?? 0;
          this.getcomplent(this.sala_reserva);
          this.checkboxes.forEach((checkbox, i) => {});
          this.mostrarHourGrid = true;
          this.sumaComplement('bg-danger');
          this.mostrarPeu = true;
          console.log('Ok');
        },
      });    
  }

  handleEvents(events: EventApi[]) {
    this.currentEvents.set(events);
    this.changeDetector.detectChanges(); // workaround for pressionChangedAfterItHasBeenCheckedError
  }

  desarSala() {
    let color = this.sales.find((reg) => reg.id == this.sala_reserva)?.color ?? '';
    let nom = this.sales.find((reg) => reg.id == this.sala_reserva)?.descripcio ?? '';
    // this.id_usuari
    // this.preu_sala_total

    const horasMarcadas = this.botones
    .filter(btn => btn.nativeElement.classList.contains('bg-warning'))
    .map(btn => btn.nativeElement.textContent.trim().split(' a ')[0])
    .join('#');

    const complements = this.checkboxes
    .filter(cb => cb.nativeElement.checked)
    .map(cb => cb.nativeElement.name.trim().split('_')[1])
    .join('#');    
            
    const nuevos = [...this.eventos()];

    nuevos.push({
      id: '2',
      title: nom,
      groupId: this.sala_reserva,
      start: `${this.data_reserva_ini}T${'16:00:00'}`,
      end: `${this.data_reserva_fin}T${'17:30:00'}`,      
      backgroundColor: color,
      borderColor: '#dc3545',
      textColor: '#000000',  
      allDay: this.data_reserva_ini == this.data_reserva_fin? true: false,     
    });
    this.eventos.set(nuevos);
    this.tancarModal();
  }

  carregaDies() {
    let any = '2025';
    this.calendariService.getCarga(any, this.id_edifici).subscribe({
      next: (data) => {
        const nuevos = [...this.eventos()];
        for (let i = 0; i < data.length; i++) {          
          nuevos.push({
            id: data[i].id,
            title: data[i].descripcio,
            groupId: data[i].sala,
            start: `${data[i].dia_inici}T${data[i].hora_inici}`,
            end: `${data[i].dia_fi}T${data[i].hora_fi}`,                       
            backgroundColor: data[i].color,
            borderColor: '#dc3545',
            textColor: '#000000',      
            allDay: data[i].dia_inici == data[i].dia_fi? true: false,      
          });
        }
        this.eventos.set(nuevos);
      },
      error: (error) => {
        console.log(error);
      },
      complete: () => {},
    });
  }

  saveReserva() {
    
  }
}
