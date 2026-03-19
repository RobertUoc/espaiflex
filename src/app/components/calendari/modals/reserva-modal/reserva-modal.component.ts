import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, NgClass, NgIf } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { PipePreuPipe } from '../../../../pipe/pipePreu.pipe';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Sales } from '../../../../models/sales.model';
import { Complements } from '../../../../models/complements.model';
import { ErrorEvent } from '../../../../models/errorEvent.model';
import { HoraItem } from '../../../../models/horaItem.model';

@Component({
  selector: 'app-reserva-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PipePreuPipe],
  templateUrl: './reserva-modal.component.html'
})

export class ReservaModalComponent {

  // Entradas
  @Input() form!: FormGroup;
  @Input() esMismaFecha!: boolean;
  @Input() sales: Sales[] = [];
  @Input() complements: Complements[] = [];
  @Input() miraDia: any[] = [];
  @Input() mostrarHourGrid = false;
  @Input() mostrarPeu = false;
  @Input() preuTotal = 0;
  @Input() errorEntrada = '';
  @Input() missatge = '';
  @Input() altaReserva = '0';
  @Input() selectedComplements: number[] = [];  
  @Input() isNew!: boolean;  
  @Input() totalPrecio = 0;
  @Input() canDelete = false;
  @Input() hasError = false;
  @Input() showReviews = false;
  @Input() erroresConsulta: ErrorEvent[] = [];

  // Salidas
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<void>();
  @Output() saveOpinion = new EventEmitter<void>();
  @Output() changeSala = new EventEmitter<void>();  
  @Output() toggleHora = new EventEmitter<HoraItem>();
  @Output() toggleComplement = new EventEmitter<number>();
  @Output() borrar = new EventEmitter<void>();
  @Output() opinion = new EventEmitter<void>();
  @Output() frecuenciaChange = new EventEmitter<void>();
  @Output() salaChange = new EventEmitter<void>();   
  
}


