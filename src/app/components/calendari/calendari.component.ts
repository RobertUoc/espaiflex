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
import { CommonModule, NgClass, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Users } from '../../models/users.model';
import { HoraItem } from '../../models/horaItem.model';
import { Sales } from '../../models/sales.model';
import { Horas } from '../../models/horas.model';
import { Reserva } from '../../models/reserva.model';
import { Complements } from '../../models/complements.model';
import { UsersService } from '../../service/users.service';
import { SalesService } from '../../service/sales.service';
import { ComentariService } from '../../service/comentaris.service';
import { ComplementsService } from '../../service/complements.service';
import { CalendariService } from '../../service/calendari.service';
import Swal from 'sweetalert2';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import esLocale from '@fullcalendar/core/locales/es';
import { ErrorEvent } from '../../models/errorEvent.model';
import { RegisterModalComponent } from './modals/register-modal/register-modal.component';
import { LoginModalComponent } from './modals/login-modal/login-modal.component';
import { MostrarDiaModalComponent } from './modals/mostrar-dia-modal/mostrar-dia-modal.component';
import { SalaModalComponent } from './modals/sala-modal/sala-modal.component';
import { ReservaModalComponent } from './modals/reserva-modal/reserva-modal.component';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-calendari',
  imports: [
    FormsModule,
    FullCalendarModule,
    NgIf,
    NgClass,
    CommonModule,  
    ReactiveFormsModule,
    RegisterModalComponent,
    LoginModalComponent,
    MostrarDiaModalComponent,
    SalaModalComponent,
    ReactiveFormsModule,
    ReservaModalComponent
  ],
  templateUrl: './calendari.component.html',
  styleUrls: ['./calendari.component.css'],
})
export class CalendariComponent implements OnInit {
  loginData = {
    email: '',
    password: '',
  };
  public TODAY_STR = new Date().toISOString().replace(/T.*$/, ''); // Avui
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
  public datosConsulta = [new ErrorEvent()];
  // Formulario Reserva
  public reservaForm!: FormGroup;
  public data_reserva_ini: string = '';
  public data_reserva_fin: string = '';
  public frecuencia: string = 'diaria';
  public sala_reserva: number = 0;
  public missatge: string = '';
  public errorEntrada: string = '';
  public max_sala: string = '1';
  public mostrarHourGrid: boolean = false;
  public mostrarPeu: boolean = false;
  public agrupado: { [key: string]: { hora_inici: string; estado: string, cssClass: string, seleccionada: boolean }[] } =
    {};
  public preu_sala: number = 0;
  public preu_sala_total: number = 0;
  public preu_sala_parcial: number = 0;
  public horari: number = 1;
  public selectedComplements: number[] = [];
  public verResenas: boolean = false;
  public totalParcial: number = 0;
  public totalPrecio: number = 0;
  public isSaving: boolean = true;
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
  public alta_reserva_pare: string = '0';
  public verBoton: string = '1';
  getInSiteForm: any;

  id_edifici: number = 0;
  public dias_contar = 1;
  public mostrarRegister = false;
  public mostrarLogin = false;
  public mostrarLoginCabecera = false;
  public mostrarDia = false;
  public mostrarSala = false;
  public mostrarReserva = false;

  calendarVisible = signal(true);

  calendarOptions = computed((): CalendarOptions => {
    const isMobile = window.innerWidth < 768;
    return {
      plugins: [interactionPlugin, dayGridPlugin, timeGridPlugin],
      headerToolbar: {
        left: isMobile ? 'prev,next' : 'prev,next today',
        center: 'title',
        right: isMobile
          ? 'today'
          : 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
      },
      initialView: 'dayGridMonth',
      contentHeight: 'auto',
      aspectRatio: isMobile ? 0.7 : 1.4,
      events: this.eventos(),
      locale: 'es',
      locales: [esLocale],
      weekends: true,
      editable: true,
      selectable: true,
      selectMirror: true,
      dayMaxEvents: true,
      titleFormat: isMobile
        ? { month: 'long' } // solo mes
        : { month: 'long', year: 'numeric' },
      select: this.handleDateSelect.bind(this),
      eventClick: this.handleEventClick.bind(this),
      eventsSet: this.handleEvents.bind(this),
    };
  });

  @ViewChildren('horesSelected') botones!: QueryList<ElementRef>;
  @ViewChildren('checkComplemento') checkboxes!: QueryList<ElementRef>;

  currentEvents = signal<EventApi[]>([]);

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private changeDetector: ChangeDetectorRef,
    private userService: UsersService,
    private salesService: SalesService,
    private comentariService: ComentariService,
    private complementService: ComplementsService,
    private calendariService: CalendariService
  ) {}

  ngOnInit() {
    this.id_edifici = Number(this.route.snapshot.paramMap.get('id')) || 0;
    this.getSales(this.id_edifici);
    this.carregaDies();
    this.createForm();
  }

  createForm() {
    // Formulario Reserva
    this.reservaForm = this.fb.group({
      id_user: [''],
      id: ['0'],
      fechaInicial: [
        new Date().toISOString().substring(0, 10),
        [Validators.required],
      ],
      fechaFinal: [
        new Date().toISOString().substring(0, 10),
        [Validators.required],
      ],
      frecuencia : ['diahoy'], // diahoy | diaria | semanal | mensual

      diasSemana: this.fb.group({
        lunes: [false],
        martes: [false],
        miercoles: [false],
        jueves: [false],
        viernes: [false],
        sabado: [false],
        domingo: [false],
      }),
      mensualidad: this.fb.group({
        tipo: ['1'],
        numeroDia: [1, [Validators.min(1), Validators.max(31)]],
        periodo: ['primero'],
        diaSemana: ['lunes'],
      }),
      sala_reserva: ['', [Validators.required]],

      max_sala: [{ value: '', disabled: true }],
      horari_sala: [{ value: '', disabled: true }],
      opinion: [''],
      puntuacion: ['1'],
    });

    this.reservaForm.get('fechaInicial')?.valueChanges.subscribe(() => this.controlFrecuencia());
    this.reservaForm.get('fechaFinal')?.valueChanges.subscribe(() => this.controlFrecuencia());

  }

  canviFrecuencia() {
    this.errorEntrada = '';
    this.missatge = '';
  }

  actualizarMaximo() {
    // Ok
    this.errorEntrada = '';
    this.datosConsulta = [];
    let salaId = this.reservaForm.get('sala_reserva')?.value;
    let DadesSala = this.sales.find((reg) => reg.id == salaId);
    this.max_sala = DadesSala?.max_ocupacio ?? '';
    this.horari = DadesSala?.horari ?? 0;
    this.missatge = DadesSala?.missatge ?? '';
    this.reservaForm.get('max_sala')?.setValue(DadesSala?.max_ocupacio ?? '');
    this.reservaForm.get('horari_sala')?.setValue(DadesSala?.horari ?? '');
    if (salaId != '') {
      this.generate();
    }
  }

  getSales(id_edifici: number) {
    this.salesService.getByEdifici(id_edifici).subscribe({
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

  getSala(id_sala: number) {    
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
          data.horari,
          data.imatge,
          data.reservas_mes
        );
      },
      error: (error) => {
        console.log(error);
      },
      complete: () => {
        // Seleccionats
        this.getcomplement(id_sala);        
      },
    });
    this.mostrarSala = true;
  }

  getcomplement(id_sala: number) {
    this.salesService.getSeleccionats(id_sala).subscribe({
      next: (data) => {
        this.complements = data;
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  tornar() {
    this.router.navigate(['/']);
  }

  reserva(todo:boolean) {    
    if (todo) {
      this.verBoton = '1';
      this.createForm();
      this.data_reserva_ini = new Date().toISOString().substring(0, 10);
      this.data_reserva_fin = new Date().toISOString().substring(0, 10);
      this.frecuencia = '';          
    }    
    this.errorEntrada = '';
    this.datosConsulta = [];
    this.selectedComplements = [];
    this.alta_reserva = '0';
    this.mostrarReserva = true;    
    this.mostrarHourGrid = false;
    this.mostrarPeu = false;
    this.agrupado = {};    
    this.dias_contar = 1;
    // Reset Campos
    this.reservaForm.get('sala_reserva')?.reset();  
    this.isSaving = true;
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
    this.preu_sala_parcial = 0;
  }

  creaHorari(data: Horas[]) {
    // horari
    this.agrupado = {};
    let compara = '0';

    if(!data || !Array.isArray(data)){
      return;
    }    
    data.forEach((item) => {
      if (!this.agrupado[item.descripcio]) {
        this.agrupado[item.descripcio] = [];
        compara = '0';
      }
      // Crear Capcelera
      this.horari = Number(item.tipus);
      compara = this.CrearBotons(item, compara);
    });
    this.horas = this.horas.
    sort();    
    this.mira_dia = Object.entries(this.agrupado).map(([id, items]) => ({
      id,
      items
    }));    
  }

  generate() {
    this.resetGenerate();
    this.sala_reserva = this.reservaForm.get('sala_reserva')?.value;
    if (this.sala_reserva == 0) {
      this.mostrarAlertes(
        'Atención!!!',
        'No se ha seleccionado ningua sala.',
        'success',
        'Aceptar'
      );
      return;
    }
    //
    //
    // this.data_reserva_ini
    let fecha = '1900-01-01';
    if (this.alta_reserva != '0') {
      fecha = this.data_reserva_ini;
    }
    // getMiraReserva
    console.log('Reserva : ' + this.alta_reserva);
    // Fechas 
    let fechaInicial = this.reservaForm.get('fechaInicial')?.value;
    let fechaFinal = this.reservaForm.get('fechaFinal')?.value;
    let frecuencia = this.reservaForm.get('frecuencia')?.value;
    // dias de la semana
    let matriuDias: number[] = [0,0,0,0,0,0,0];
    let reservaDias = this.reservaForm.get('diasSemana') as FormGroup;
    const ordenDias = ['lunes','martes','miercoles','jueves','viernes','sabado','domingo'];
    matriuDias = ordenDias.map(dia => 
      reservaDias.get(dia)?.value ? 1 : 0
    );    
    let diesSeleccionats = matriuDias.join('#');   

    let seleccio_mensual = this.reservaForm.get('mensualidad.tipo')?.value;
    let dia_seleccionado = this.reservaForm.get('mensualidad.numeroDia')?.value;
    let El1 = this.reservaForm.get('mensualidad.periodo')?.value;
    let El2 = this.reservaForm.get('mensualidad.diaSemana')?.value;    
    
    if (this.alta_reserva == '0') {
      this.calendariService.getDisponibilidad(this.sala_reserva,fechaInicial,fechaFinal,frecuencia,diesSeleccionats,
                                              seleccio_mensual,dia_seleccionado,El1,El2).subscribe({
        next: (data) => {
          console.log(data);
          this.creaHorari(data);
          this.dias_contar = data[0].contardias;          
        },
        error: (error) => {
          console.log(error);
        },
        complete: () => {
          // Busco els complements de la sala
          this.preu_sala = this.sales.find((item) => item.id == this.sala_reserva)?.preu ?? 0;
          this.getcomplement(this.sala_reserva);
          this.checkboxes.forEach((checkbox, i) => {});
          this.mostrarHourGrid = true;
        },
      });
    }
    else {
      this.calendariService.getMiraDia(this.sala_reserva, parseInt(this.alta_reserva)).subscribe({
        next: (data) => {
          console.log(data);
          this.creaHorari(data);
        },
        error: (error) => {
          console.log(error);
        },
        complete: () => {
          // Busco els complements de la sala
          this.preu_sala = this.sales.find((item) => item.id == this.sala_reserva)?.preu ?? 0;
          this.getcomplement(this.sala_reserva);
          this.checkboxes.forEach((checkbox, i) => {});
          this.mostrarHourGrid = true;
        },
      });
    }
  }

  private calcularHoraFinal(horari: number, hora_inici: string): string {
    const [hora, minuto] = hora_inici.split(':');
    const horaNum = +hora;
    let horaFinal = `${hora.padStart(2, '0')} a ${(horaNum + 1).toString().padStart(2, '0')}`;
    if (horari == 2) { horaFinal = minuto === '00'  ? `${hora}:00 a ${hora}:30` : `${hora}:${minuto} a ${(horaNum + 1).toString().padStart(2, '0')}:00`; }
    return horaFinal;
  }

  CrearBotons(item: any, compara: string): string {
    let horaFinal = '';
    //
    let inici = '0';
    horaFinal = this.calcularHoraFinal(this.horari, item.hora_inici);
    if (!this.horas.includes(horaFinal)) { this.horas.push(horaFinal); }
    inici = horaFinal.substring(0, 2);
    if (item.estado != 'No informado') { compara = item.estado.substring(0, 2); }
    if (inici < compara) { item.estado = compara; }
    this.agrupado[item.descripcio].push({
      hora_inici: horaFinal,
      estado: item.estado, 
      cssClass: item.estado == 'No informado' ? 'bg-success' : 'bg-danger',
      seleccionada: false
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
          this.horari = Number(item.tipus);
          compara = this.CrearBotons(item, compara);
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
        console.log('Dia Ok');
      },
    });
    const calendarApi = selectInfo.view.calendar;
    calendarApi.unselect(); // clear date selection
    this.mostrarDia = true;
  }

  handleEventClick(clickInfo: EventClickArg) {    
    this.mostrarReserva = true;
    this.mostrarHourGrid = false;
    this.agrupado = {};    
    this.data_reserva_ini = clickInfo.event.startStr.substring(0, 10);
    this.resetGenerate();
    this.mostrarPeu = true;
    this.sala_reserva = 0;
    this.alta_reserva = clickInfo.event.groupId;
    this.alta_reserva_pare = clickInfo.event.id;
    if (this.alta_reserva != '0') {
      this.reservaForm.get('fechaInicial')?.disable();
      this.reservaForm.get('fechaFinal')?.disable();
      this.reservaForm.get('frecuencia')?.disable();
    }

    this.calendariService.getDadesReserva(clickInfo.event.groupId).subscribe({
      next: (data) => {
        this.reservas = data;
      },
      error: (error) => {
        console.log(error);
      },
      complete: () => {
        let dia_reserva = this.reservas[0];
        this.reservaForm.get('diasSemana')?.disable();
        this.reservaForm.get('sala_reserva')?.disable();
        this.reservaForm.get('mensualidad')?.disable();
        this.preu_sala_total = +dia_reserva.import_sala;
        this.preu_sala_parcial = 0;
        this.max_sala = dia_reserva.max_ocupacio;
        this.horari = Number(dia_reserva.horari);
        this.missatge = dia_reserva.missatge;
        this.reservaForm.patchValue({
          id_user: dia_reserva.id_user,
          id: dia_reserva.id,
          fechaInicial: dia_reserva.dia_inici,
          fechaFinal: dia_reserva.dia_fi,
          sala_reserva: dia_reserva.sala,
          frecuencia: dia_reserva.frequencia,
          diasSemana: {
            lunes: dia_reserva.dilluns,
            martes: dia_reserva.dimarts,
            miercoles: dia_reserva.dimecres,
            jueves: dia_reserva.dijous,
            viernes: dia_reserva.divendres,
            sabado: dia_reserva.dissabte,
            domingo: dia_reserva.diumenge,
          },
          mensualidad: {
            numeroDia: dia_reserva.dia_mes,
            tipo: dia_reserva.tipo,
            periodo: dia_reserva.el_semana,
            diaSemana: dia_reserva.el_dia,
          },
        });
        this.mostrarPeu = true;
        this.actualizarMaximo();             
        this.mostrarPeu = true;
        this.selectedComplements = [];
        this.selectedComplements = this.reservas.map((r) => +r.id_complements);
        this.preu_sala_parcial = parseFloat(dia_reserva.preu_sala);
        this.preu_sala_total = parseFloat(dia_reserva.preu_sala);

    this.calendariService
      .getMiraReserva(this.data_reserva_ini, this.sala_reserva, Number(clickInfo.event.id))
      .subscribe({
        // next: (data) => { this.creaHorari(data); },
        error: (error) => { console.log(error); },
        complete: () => {
          // Busco els complements de la sala
          this.preu_sala = this.sales.find((item) => item.id == this.sala_reserva)?.preu ?? 0;
          this.getcomplement(this.sala_reserva);
          this.checkboxes.forEach((checkbox, i) => {});
          this.mostrarHourGrid = true;                  
          this.recalcularPrecio();          
          this.preu_sala_parcial = parseFloat(this.reservas[0].preu_sala);
          this.preu_sala_total = parseFloat(this.reservas[0].preu_sala);
          this.mostrarPeu = true;
          console.log('Lectura Ok');
        },
      });

      },
    });
  }

  handleEvents(events: EventApi[]) {
    this.currentEvents.set(events);
    this.changeDetector.detectChanges(); // workaround for pressionChangedAfterItHasBeenCheckedError
  }

  carregaDies() {
    let any = new Date().getFullYear().toString();        
    this.calendariService.getCarga(any, this.id_edifici).subscribe({
      next: (data) => {
        const nuevosLectura = [...this.eventos()];
        for (let i = 0; i < data.length; i++) {                
          nuevosLectura.push({
            id: String(data[i].id),
            title: data[i].descripcio,
            groupId: data[i].id_reserva,
            start: data[i].start,
            end: data[i].end,
            backgroundColor: data[i].color,
            borderColor: '#dc3545',
            textColor: '#000000',
            allDay: data[i].dia_inici == data[i].dia_fi ? true : false,
          });
        }
        this.eventos.set(nuevosLectura);
      },
      error: (error) => {
        console.log(error);
      },
      complete: () => {},
    });
  }

  saveReserva() {
    let frecuencia = this.reservaForm.get('frecuencia')?.value;    
    let error = this.validaReserva(frecuencia);
    if (error) {
      this.errorEntrada = error;    
      return;
    }
    // Validación general del formulario    
    if (this.reservaForm.invalid) {
      this.errorEntrada = 'Hay campos obligatorios sin completar.';
      this.verBoton = '1';
      this.reserva(true);
      return;
    }
  }

  private validaReserva(frecuencia: string): string | null {
    switch (frecuencia) {
      case 'semanal':
        return this.validaSemana();
      case 'mensual':
        return this.validaMes();
      default:
        return null;
    }
  }

  private validaSemana(): string | null {
    this.errorEntrada = '';
    this.datosConsulta = [];
    const dias = this.reservaForm.get('diasSemana')?.value;
    const algunDiaSeleccionado = Object.values(dias).some((v) => v === true);
    return !algunDiaSeleccionado
      ? 'Debes seleccionar al menos un día de la semana.'
      : null;
  }

  private validaMes(): string | null {
    const mensualidad = this.reservaForm.get('mensualidad')?.value;
    let dia = this.reservaForm.get('mensualidad.numeroDia')?.value;
    switch (mensualidad.tipo) {
      case '1':
        return isNaN(dia) || dia < 1 || dia > 31
          ? 'El número de día debe estar entre 1 y 31.'
          : null;
      case '2':
        const periodoValido = [
          'primero',
          'segundo',
          'tercero',
          'cuarto',
          'ultimo',
        ].includes(mensualidad.periodo);
        const diaSemanaValido = [
          'lunes',
          'martes',
          'miercoles',
          'jueves',
          'viernes',
          'sabado',
          'domingo',
        ].includes(mensualidad.diaSemana);
        return !periodoValido || !diaSemanaValido
          ? 'Debes seleccionar un periodo y un día de la semana válidos.'
          : null;
      default:
        return 'Tipo de mensualidad inválido.';
    } 
  }

  desarSala() {   
    this.datosConsulta = [];
    let feInicial = this.reservaForm.get('fechaInicial')?.value;
    let feFinal = this.reservaForm.get('fechaFinal')?.value;
    let horari = this.reservaForm.get('horari_sala')?.value;
    let frecuencia = this.reservaForm.get('frecuencia')?.value;
    // dias de la semana
    let matriuDias: number[] = [0,0,0,0,0,0,0];
    let reservaDias = this.reservaForm.get('diasSemana') as FormGroup;
    const ordenDias = ['lunes','martes','miercoles','jueves','viernes','sabado','domingo'];
    matriuDias = ordenDias.map(dia => 
      reservaDias.get(dia)?.value ? 1 : 0
    );    
    let diesSeleccionats = matriuDias.join('#');    
    let seleccio_mensual = this.reservaForm.get('mensualidad.tipo')?.value;
    let dia_seleccionado = this.reservaForm.get('mensualidad.numeroDia')?.value;
    let El1 = this.reservaForm.get('mensualidad.periodo')?.value;
    let El2 = this.reservaForm.get('mensualidad.diaSemana')?.value;
    this.data_reserva_ini = new Date(feInicial).toISOString().substring(0, 10);
    this.data_reserva_fin = new Date(feFinal).toISOString().substring(0, 10);
    let color = this.sales.find((reg) => reg.id == this.sala_reserva)?.color ?? '';
    let nom   = this.sales.find((reg) =>reg.id == this.sala_reserva)?.descripcio ?? '';
    let totDia = this.data_reserva_ini == this.data_reserva_fin ? true : false;

    // Carrego complements
    const complements = this.selectedComplements.map(id => this.complements.find(c => +c.id === id)?.id).filter(Boolean).join('#');    

    // Agrupacio d'hores
    let ranges = [];
    let start = null;
    let end = '';  

    let selectedHours: string[] = [];      
    this.mira_dia.forEach((bloque) => {
        bloque.items.forEach((hora: HoraItem) => {
          if (hora.seleccionada) {
            let h = hora.hora_inici.trim().split(' a ')[0];            
            if (/^\d{1,2}$/.test(h)) {
              h = h.padStart(2, '0') + ':00';
            }      
            selectedHours.push(h);
          }
        });
    });      
    
    let suma_minutos = horari == '1' ? 60 : 30;
    const diferenciaMinutos = (hora1: string, hora2: string): number => {
      const [h1, m1] = hora1.split(':').map(Number);
      const [h2, m2] = hora2.split(':').map(Number);
      return h2 * 60 + m2 - (h1 * 60 + m1);
    };    
    
    for (let i = 0; i < selectedHours.length; i++) {
      const inicio = selectedHours[i];
      const [horas, minutos] = inicio.split(':').map(Number);
      const nueva = new Date(0, 0, 0, horas, minutos);
      nueva.setMinutes(nueva.getMinutes() + suma_minutos);
      const final = nueva.toTimeString().slice(0, 5);
      if (start === null) {
        start = inicio;
        end = final;
      } else if (diferenciaMinutos(end, inicio) === 0) {
        end = final;
      } else {
        ranges.push({ inicio: start, final: end });
        start = inicio;
        end = final;
      }
    }
    if (start !== null) {
      ranges.push({ inicio: start, final: end });
    }   
    // Horas agrupadas
    let HorasAgrupadas = JSON.stringify(ranges);    

    if ((frecuencia == 'diahoy')||(frecuencia == 'diaria')||(frecuencia == 'mensual')) {
      let matriuDias: number[] = [0,0,0,0,0,0,0];
      diesSeleccionats = matriuDias.join('#');       
    }
    if ((frecuencia == 'diahoy')||(frecuencia == 'diaria')||(frecuencia == 'semanal')) {
      seleccio_mensual = '';
      dia_seleccionado = '';
      El1 = '';
      El2 = '';
    }

    // No estan les dades.
    if (frecuencia == 'semanal') {
      const suma = matriuDias.reduce((acc, val) => acc + val, 0);
      if (suma == 0) {
       this.errorEntrada = 'Tienes que seleccionar dias de la semana!!!'; 
       return;
      }
    }

    // Mirar Conflicte.
    let horaslibres = 0;    
    if (horaslibres == 1) {
       this.errorEntrada = 'HORAS ocupadas!!!';
    }    

    // Grabem
    this.verBoton = '2';
    this.isSaving = false;

    console.log(HorasAgrupadas);
    console.log(this.dias_contar);
    console.log(this.preu_sala);

    this.calendariService
      .insertEvent(
        String(this.sala_reserva),
        this.data_reserva_ini,
        this.data_reserva_fin,
        frecuencia,
        diesSeleccionats,        
        seleccio_mensual,
        dia_seleccionado,
        El1,
        El2,
        this.preu_sala_total,
        this.id_usuari,
        HorasAgrupadas,
        this.dias_contar,
        this.preu_sala_parcial,
        complements
      )
      .subscribe({
        next: (data) => {
        const nuevosInsert = [...this.eventos()];
        for (let i = 0; i < data.length; i++) {                
          nuevosInsert.push({
            id: String(data[i].id),
            title: data[i].descripcio,
            groupId: data[i].id_reserva,
            start: data[i].start,
            end: data[i].end,
            backgroundColor: data[i].color,
            borderColor: '#dc3545',
            textColor: '#000000',
            allDay: data[i].dia_inici == data[i].dia_fi ? true : false,
          });
          console.log(data[i].id);
        }
        this.eventos.set(nuevosInsert);        
        console.log('ok');
        this.tancarSala();    
        this.isSaving = true;     
        },
        error: (err) => {
          Swal.fire({
            title: 'Atención!!!',
            text: 'Esta tramo esta ocupado ' + err.error.detalle.hora_inici + ' a ' + err.error.detalle.hora_fi,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Ok',
          }).then((result) => {
            this.isSaving = true; 
            // Refrescar
            this.carregaDies();
            this.tancarSala();
          });
          console.error('Error', err);
          console.log(err.error);
        },
        complete: () => {
        },
      });
  }

  treureSala() {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'No',
    }).then((result) => {
      if (result.isConfirmed) {
        console.log('Confirmado ' + this.alta_reserva_pare + ' Fill ' + this.alta_reserva);
        // Anular Event i generar factura abono this.alta_reserva
        this.calendariService.deleteEvent(this.alta_reserva).subscribe({
          next: () => {
            // Treure Event
            const actuales = [...this.eventos()];
            const filtrados = actuales.filter(
              (ev) =>  parseInt(ev.groupId) != parseInt(this.alta_reserva)              
            );
            this.eventos.set(filtrados);
            this.tancarSala();     
                 
          },
          error: (err) => {
            console.error('Error', err);
          },
          complete: () => {},
        });
      } else if (result.isDismissed) {
        console.log('Cancelado');
      }
    });
  }

  tancarSala() {
    this.verResenas = false;
    this.mostrarReserva = false
  }

  ponOpinion() {
    this.verResenas = true;
    this.reservaForm.patchValue({
      puntuacion: 1,
      opinion: '',
    });
  }

  tancarOpinion() {
    this.verResenas = false;
  }

  guardarOpinion() {    
    this.verResenas = false;
    let puntuacion = this.reservaForm.get('puntuacion')?.value;
    let opinion = this.reservaForm.get('opinion')?.value;
    this.comentariService
      .insertComentari(this.alta_reserva, this.id_usuari, opinion, puntuacion, this.usuari)
      .subscribe((response) => {
        console.log(response);
      });
  }

  getHoraClass(col: string): string {
    console.log(col);
    return col == 'No informado' ? 'bg-success' : 'bg-danger';
  }

  abrirActualizar() {
    if (this.id_usuari === 0) return;
    this.mostrarRegister = true;
  }  

  onUserUpdated(user: Users) {
    this.registerData = user;
    this.usuari = user.name;
    this.id_usuari = Number(user.id);
  }  

  onLogin(user: Users) {    
    this.registerData = user;
    this.usuari = user.name;
    this.id_usuari = user.id;    
    this.reserva(true);
  }

  onLoginCabecera(user: Users) {    
    this.registerData = user;
    this.usuari = user.name;
    this.id_usuari = user.id;        
  }

  canDeleteReserva(): boolean {
    return (
      this.alta_reserva !== '0' &&
      this.id_usuari === this.reservaForm.get('id_user')?.value
    );
  }

  sumaComplement(clase: string) {
    let total = 0;
    let btn = this.botones.toArray();
    let hihabtn = btn.filter((boton) =>
      boton.nativeElement.classList.contains(clase)
    ).length;
    if (hihabtn > 0) {
      this.mostrarPeu = true;
      this.preu_sala_total = +this.preu_sala * hihabtn * this.dias_contar;
      this.preu_sala_parcial = +this.preu_sala * hihabtn * this.dias_contar;
      this.checkboxes.forEach((checkbox, i) => {
        if (checkbox.nativeElement.checked) {
          total += this.complements[i].preu;
        }
      });
    }
    this.preu_sala_total += total;
    this.saveReserva();
  }

  recalcularPrecio() {        
    const horasSeleccionadas = this.mira_dia
      .flatMap(d => d.items)
      .filter((h: HoraItem) => h.seleccionada);    
    this.preu_sala_total = horasSeleccionadas.length * this.preu_sala * this.dias_contar;
    this.preu_sala_parcial = horasSeleccionadas.length * this.preu_sala * this.dias_contar;
    let totalComplementos:number = 0;  
    for (const id of this.selectedComplements) {
      const comp = this.complements.find(c => +c.id === id);
      if (comp) { 
        totalComplementos += +comp.preu; 
      }
    }      
    this.preu_sala_total += totalComplementos;  
    this.mostrarPeu = horasSeleccionadas.length > 0;
  }

  triaHora(hora: HoraItem) {
    this.mostrarPeu = false;
    this.errorEntrada = '';
    hora.seleccionada = !hora.seleccionada;
    if (hora.seleccionada) { hora.cssClass = 'bg-warning'; } else { hora.cssClass = 'bg-success'; }
    this.recalcularPrecio();
  }
  
  onToggleComplement(compleId: number) {
    if (this.selectedComplements.includes(compleId)) {
      this.selectedComplements =
        this.selectedComplements.filter(id => id !== compleId);
    }     
    else { this.selectedComplements = [...this.selectedComplements, compleId]; }
    this.recalcularPrecio();
  }
  
  editarPerfil() {
    console.log(this.registerData)
  }

  get esMismaFecha(): boolean {
    const inicio = this.reservaForm.get('fechaInicial')?.value;
    const fin = this.reservaForm.get('fechaFinal')?.value;
    return inicio === fin;
  }

  controlFrecuencia() {
    if (this.esMismaFecha) {
      this.reservaForm.patchValue({ frecuencia: 'diahoy' });
    } else {
      if (this.reservaForm.get('frecuencia')?.value === 'diahoy') {
        this.reservaForm.patchValue({ frecuencia: 'diaria' });
      }
    }
  }

}
