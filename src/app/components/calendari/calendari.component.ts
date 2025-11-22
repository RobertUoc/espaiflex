import {
  Component,
  OnInit,
  signal,
  computed,
  ChangeDetectorRef,
  QueryList,
  ViewChildren,
  ViewChild,
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
import { ComentariService } from '../../service/comentaris.service';
import { ComplementsService } from '../../service/complements.service';
import { PipePreuPipe } from '../../pipe/pipePreu.pipe';
import { PipeFechaPipe } from '../../pipe/pipeFecha.pipe';
import { CalendariService } from '../../service/calendari.service';
import Swal from 'sweetalert2';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { of } from 'rxjs';
import esLocale from '@fullcalendar/core/locales/es';
import { InsertEvent } from '../../models/insertEvent.model';
import { ErrorEvent } from '../../models/errorEvent.model';
import { response } from 'express';

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
  public datosConsulta = [new ErrorEvent()];
  // Formulario Reserva
  public reservaForm!: FormGroup;
  public data_reserva_ini: string = '';
  public data_reserva_fin: string = '';
  public frecuencia: string = 'diaria';
  public sala_reserva: string = '';
  public missatge: string = '';
  public errorEntrada: string = '';
  public max_sala: string = '1';
  public mostrarHourGrid: boolean = false;
  public mostrarPeu: boolean = false;
  public agrupado: { [key: string]: { hora_inici: string; estado: string }[] } =
    {};
  public preu_sala: number = 0;
  public preu_sala_total: number = 0;
  public horari: string = '1';
  public selectedComplements: number[] = [];
  public verResenas: boolean = false;
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
      locale: 'es',
      locales: [esLocale],
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
    private comentariService: ComentariService,
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
      id_user: ['', ''],
      id: ['0', ''],
      fechaInicial: [
        new Date().toISOString().substring(0, 10),
        [Validators.required, Validators.maxLength(10)],
      ],
      fechaFinal: [
        new Date().toISOString().substring(0, 10),
        [Validators.required, Validators.maxLength(10)],
      ],
      frecuencia: ['diaria'], // diaria | semanal | mensual
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
        numeroDia: ['1'],
        periodo: ['primer'],
        diaSemana: ['lunes'],
      }),
      sala_reserva: ['', [Validators.required, Validators.maxLength(6)]],
      max_sala: [{ value: '', disabled: true }],
      horari_sala: [{ value: '', disabled: true }],
      opinion: [''],
      puntuacion: ['1'],
    });
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
    this.horari = DadesSala?.horari ?? '';
    this.missatge = DadesSala?.missatge ?? '';
    this.reservaForm.get('max_sala')?.setValue(DadesSala?.max_ocupacio ?? '');
    this.reservaForm.get('horari_sala')?.setValue(DadesSala?.horari ?? '');
    if (salaId != '') {
      this.generate();
    }
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
          data.horari,
          data.imatge
        );
      },
      error: (error) => {
        console.log(error);
      },
      complete: () => {
        // Seleccionats
        this.getcomplement(id_sala);
        console.log('Ok');
      },
    });
    this.finestra = 99;
    this.modalVisible[this.finestra] = true;
  }

  getcomplement(id_sala: string) {
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
    this.saveReserva();
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
          this.tancarModal();
          console.log('Ok');
        },
      });
  }

  tancarModal() {
    console.log(this.finestra);
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
    this.createForm();
    this.errorEntrada = '';
    this.datosConsulta = [];
    this.selectedComplements = [];
    this.alta_reserva = '0';
    this.finestra = 90;
    this.mostrarHourGrid = false;
    this.mostrarPeu = false;
    this.agrupado = {};
    this.data_reserva_ini = new Date().toISOString().substring(0, 10);
    this.data_reserva_fin = new Date().toISOString().substring(0, 10);
    this.sala_reserva = '0';
    this.frecuencia = '';
    this.modalVisible[this.finestra] = true;
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
    this.calendariService.getMiraDia(fecha, this.sala_reserva).subscribe({
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
        this.getcomplement(this.sala_reserva);
        this.checkboxes.forEach((checkbox, i) => {});
        this.mostrarHourGrid = true;
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
  }

  handleEventClick(clickInfo: EventClickArg) {
    this.finestra = 90;
    this.mostrarHourGrid = false;
    this.agrupado = {};
    this.modalVisible[this.finestra] = true;
    this.data_reserva_ini = clickInfo.event.startStr.substring(0, 10);
    this.resetGenerate();
    this.mostrarPeu = true;
    this.sala_reserva = clickInfo.event.groupId;
    this.alta_reserva = clickInfo.event.id;
    if (this.alta_reserva != '0') {
      this.reservaForm.get('fechaInicial')?.disable();
      this.reservaForm.get('fechaFinal')?.disable();
      this.reservaForm.get('frecuencia')?.disable();
    }
    this.calendariService.getDadesReserva(clickInfo.event.id).subscribe({
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

        this.preu_sala_total = dia_reserva.import_sala;
        this.max_sala = dia_reserva.max_ocupacio;
        this.horari = dia_reserva.horari;
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
        this.actualizarMaximo();
        this.selectedComplements = [];
        this.selectedComplements = this.reservas.map((r) => +r.id_complements);
        this.preu_sala_total = parseFloat(dia_reserva.preu_sala);
      },
    });
    this.calendariService
      .getMiraReserva(
        this.data_reserva_ini,
        this.sala_reserva,
        clickInfo.event.id
      )
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
          this.getcomplement(this.sala_reserva);
          this.checkboxes.forEach((checkbox, i) => {});
          this.mostrarHourGrid = true;
          this.sumaComplement('bg-danger');
          this.mostrarPeu = true;
          console.log('Lectura Ok');
        },
      });
  }

  handleEvents(events: EventApi[]) {
    this.currentEvents.set(events);
    this.changeDetector.detectChanges(); // workaround for pressionChangedAfterItHasBeenCheckedError
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
            allDay: data[i].dia_inici == data[i].dia_fi ? true : false,
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
    let frecuencia = this.reservaForm.get('frecuencia')?.value;
    let error = this.validaReserva(frecuencia);
    if (error) {
      this.errorEntrada = error;
      return;
    }
    // Validación general del formulario
    if (this.reservaForm.invalid) {
      this.errorEntrada = 'Hay campos obligatorios sin completar.';
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
          'primer',
          'segundo',
          'tercer',
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
    let matriuSeleccionats: string[] = [];
    let diesSeleccionats = '';
    let reservaDias = this.reservaForm.get('diasSemana') as FormGroup;
    Object.entries(reservaDias.controls).forEach(([dia, control]) => {
      if (control.value) {
        matriuSeleccionats.push(dia);
      }
    });
    diesSeleccionats = matriuSeleccionats.join('#');
    let seleccio_mensual = this.reservaForm.get('mensualidad.tipo')?.value;
    let dia_seleccionado = this.reservaForm.get('mensualidad.numeroDia')?.value;
    let El1 = this.reservaForm.get('mensualidad.periodo')?.value;
    let El2 = this.reservaForm.get('mensualidad.diaSemana')?.value;
    this.data_reserva_ini = new Date(feInicial).toISOString().substring(0, 10);
    this.data_reserva_fin = new Date(feFinal).toISOString().substring(0, 10);
    let color =
      this.sales.find((reg) => reg.id == this.sala_reserva)?.color ?? '';
    let nom =
      this.sales.find((reg) => reg.id == this.sala_reserva)?.descripcio ?? '';
    const complements = this.checkboxes
      .filter((cb) => cb.nativeElement.checked)
      .map((cb) => cb.nativeElement.name.trim().split('_')[1])
      .join('#');
    // Agrupacio d'hores
    let ranges = [];
    let start = null;
    let end = '';
    let selectedHours: string[] = [];
    this.botones
      .filter((btn) => btn.nativeElement.classList.contains('bg-warning'))
      .forEach((btn) => {
        let hora = btn.nativeElement.textContent.trim().split(' a ')[0];
        if (/^\d{1,2}$/.test(hora)) {
          hora = hora.padStart(2, '0') + ':00';
        }
        selectedHours.push(hora);
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
    let horaslibres = 0;
    // Miro si estan libres las horas o no

    for (let i = 0; i < ranges.length; i++) {
      let horaInici = ranges[i].inicio + ':00';
      let horaFi = ranges[i].final + ':00';
      // Llamo al servicio
      this.calendariService
        .buscarInsertDia(
          this.sala_reserva,
          this.data_reserva_ini,
          this.data_reserva_fin,
          frecuencia,
          horaInici,
          horaFi
        )
        .subscribe({
          next: (response) => {
            this.datosConsulta = response;
            if (this.datosConsulta.length > 0) {
              horaslibres = 1;
            }
          },
          error: (err) => {
            console.error('Error', err);
          },
          complete: () => {
            if (horaslibres == 0) {
              // Grabo Factura.
              this.grabaFactura(this.id_usuari, this.preu_sala_total);
              for (let i = 0; i < ranges.length; i++) {
                let horaInici = ranges[i].inicio + ':00';
                let horaFi = ranges[i].final + ':00';
                let totDia =
                  this.data_reserva_ini == this.data_reserva_fin ? true : false;
                // Diario
                if (frecuencia == 'diaria') {
                  this.insertaDia(
                    nom,
                    this.sala_reserva,
                    this.data_reserva_ini,
                    this.data_reserva_fin,
                    color,
                    horaInici,
                    horaFi,
                    totDia,
                    this.id_usuari,
                    this.preu_sala_total,
                    frecuencia,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    '',
                    '',
                    complements
                  );
                }
                // Semanal
                if (frecuencia == 'semanal') {
                  let dies = diesSeleccionats;
                  let dayMap: Record<string, number> = {
                    domingo: 0,
                    lunes: 1,
                    martes: 2,
                    miercoles: 3,
                    jueves: 4,
                    viernes: 5,
                    sabado: 6,
                  };
                  let week = dies.split('#').map((day) => dayMap[day.trim()]);
                  let start = new Date(this.data_reserva_ini);
                  let end = new Date(this.data_reserva_fin);
                  end.setDate(end.getDate() + 1);
                  for (
                    let d = new Date(start);
                    d < end;
                    d.setDate(d.getDate() + 1)
                  ) {
                    let fecha_dia = String(d.getDate()).padStart(2, '0');
                    let fecha_mes = String(d.getMonth() + 1).padStart(2, '0');
                    let fecha_ano = d.getFullYear();
                    let fechaFormateada = `${fecha_ano}-${fecha_mes}-${fecha_dia}`;
                    let dia = d.getDay();
                    if (week.includes(dia)) {
                      // Inserta.
                      let diaSemana = Array(7).fill(0);
                      diaSemana[dia] = 1;
                      this.insertaDia(
                        nom,
                        this.sala_reserva,
                        fechaFormateada,
                        fechaFormateada,
                        color,
                        horaInici,
                        horaFi,
                        true,
                        this.id_usuari,
                        this.preu_sala_total,
                        frecuencia,
                        diaSemana[0],
                        diaSemana[1],
                        diaSemana[2],
                        diaSemana[3],
                        diaSemana[4],
                        diaSemana[5],
                        diaSemana[6],
                        0,
                        0,
                        '',
                        '',
                        complements
                      );
                    }
                  }
                }
                // Mensual
                if (frecuencia == 'mensual') {
                  // Un Dia
                  if (seleccio_mensual == 1) {
                    let start = new Date(this.data_reserva_ini);
                    let end = new Date(this.data_reserva_fin);
                    end.setDate(end.getDate() + 1);
                    for (
                      let d = new Date(start);
                      d < end;
                      d.setDate(d.getDate() + 1)
                    ) {
                      let fecha_dia = String(d.getDate()).padStart(2, '0');
                      let fecha_mes = String(d.getMonth() + 1).padStart(2, '0'); // Los meses van de 0 a 11
                      let fecha_ano = d.getFullYear();
                      let fechaFormateada = `${fecha_ano}-${fecha_mes}-${fecha_dia}`;
                      let day = d.getDate();
                      if (dia_seleccionado == day) {
                        this.insertaDia(
                          nom,
                          this.sala_reserva,
                          fechaFormateada,
                          fechaFormateada,
                          color,
                          horaInici,
                          horaFi,
                          true,
                          this.id_usuari,
                          this.preu_sala_total,
                          frecuencia,
                          0,
                          0,
                          0,
                          0,
                          0,
                          0,
                          0,
                          seleccio_mensual,
                          dia_seleccionado,
                          '',
                          '',
                          complements
                        );
                      }
                    }
                  }
                  // Periode
                  if (seleccio_mensual == 2) {
                    let nombresDias = [
                      'domingo',
                      'lunes',
                      'martes',
                      'miercoles',
                      'jueves',
                      'viernes',
                      'sabado',
                    ];
                    let semanaMap: { [key: string]: number } = {
                      primer: 1,
                      segundo: 2,
                      tercer: 3,
                      cuarto: 4,
                      ultimo: 5,
                    };
                    let start = new Date(this.data_reserva_ini);
                    let end = new Date(this.data_reserva_fin);
                    end.setDate(end.getDate() + 1);
                    for (
                      let d = new Date(start);
                      d < end;
                      d.setDate(d.getDate() + 1)
                    ) {
                      let fecha_dia = String(d.getDate()).padStart(2, '0');
                      let fecha_mes = String(d.getMonth() + 1).padStart(2, '0'); // Los meses van de 0 a 11
                      let fecha_ano = d.getFullYear();
                      let fechaFormateada = `${fecha_ano}-${fecha_mes}-${fecha_dia}`;
                      let diaSemana = d.getDay();
                      let diames = d.getDate();
                      let nombreDia = nombresDias[diaSemana];
                      if (nombreDia == El2) {
                        let primerDiaMes = new Date(
                          d.getFullYear(),
                          d.getMonth(),
                          1
                        );
                        let offset =
                          primerDiaMes.getDay() === 0
                            ? 6
                            : primerDiaMes.getDay() - 1;
                        let semanaDelMes = Math.ceil((diames + offset) / 7);
                        if (semanaDelMes == semanaMap[El1]) {
                          this.insertaDia(
                            nom,
                            this.sala_reserva,
                            fechaFormateada,
                            fechaFormateada,
                            color,
                            horaInici,
                            horaFi,
                            true,
                            this.id_usuari,
                            this.preu_sala_total,
                            frecuencia,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            seleccio_mensual,
                            0,
                            El1,
                            nombreDia,
                            complements
                          );
                        }
                      }
                    }
                  }
                }
              }
              this.tancarModal();
            }
            if (horaslibres == 1) {
              this.errorEntrada = 'HORAS ocupadas!!!';
            }
          },
        });
    }
  }

  insertaDia(
    tit: string,
    sal_reserva: string,
    fIninic: string,
    fFi: string,
    color: string,
    hInici: string,
    hFi: string,
    totDia: boolean,
    i_usuari: number,
    pts: number,
    frecuencia: string,
    dom: number,
    lun: number,
    mar: number,
    mie: number,
    jue: number,
    vie: number,
    sab: number,
    tipo: number,
    dia_mes: number,
    el_semana: string,
    el_dia: string,
    _complements: string
  ) {
    let event_ini = fIninic + 'T' + hInici;
    let event_fi = fFi + 'T' + hFi;
    // Insert Base de datos
    let ids = '0';
    console.log('ALTA');
    this.calendariService
      .insertEvent(
        sal_reserva,
        fIninic,
        fFi,
        hInici,
        hFi,
        pts,
        i_usuari,
        frecuencia,
        dom,
        lun,
        mar,
        mie,
        jue,
        vie,
        sab,
        tipo,
        dia_mes,
        el_semana,
        el_dia,
        _complements
      )
      .subscribe({
        next: (response: InsertEvent) => {
          const ids = response.id;
          console.log(ids);
          const nuevos = [...this.eventos()];
          nuevos.push({
            id: ids,
            title: tit,
            groupId: sal_reserva,
            start: `${event_ini}`,
            end: `${event_fi}`,
            backgroundColor: color,
            borderColor: '#dc3545',
            textColor: '#000000',
            allDay: totDia,
          });
          this.eventos.set(nuevos);
        },
        error: (err) => {
          console.error('Error', err);
        },
        complete: () => {},
      });
  }

  grabaFactura(i_usuari: number, pts: number) {
    console.log('ALTA FACTURA');
    let iva = 21;
    let iva_importe = pts * 0.21;
    let total = pts + iva_importe;
    let fecha = new Date().toISOString().substring(0, 10);
    this.calendariService
      .grabaFactura(i_usuari, fecha, pts, iva, iva_importe, total)
      .subscribe({
        next: () => {
          console.log('Factura Grabada');
        },
        error: (err) => {
          console.error('Error', err);
        },
        complete: () => {},
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
        console.log('Confirmado');
        // Generar Abono
        this.grabaFactura(this.id_usuari, this.preu_sala_total * -1);
        // Anular Event
        this.calendariService.deleteEvent(this.alta_reserva).subscribe({
          next: () => {
            // Treure Event
            const actuales = [...this.eventos()];
            const filtrados = actuales.filter(
              (ev) => ev.id != this.alta_reserva
            );
            this.eventos.set(filtrados);
            this.tancarModal();
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
      .insertComentari(this.alta_reserva, this.id_usuari, opinion, puntuacion)
      .subscribe((response) => {
        console.log(response);
      });
  }
}
