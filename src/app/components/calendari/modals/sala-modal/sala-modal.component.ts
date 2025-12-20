import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PipePreuPipe } from '../../../../pipe/pipePreu.pipe';
import { Sales } from '../../../../models/sales.model';
import { Complements } from '../../../../models/complements.model';

@Component({
  selector: 'app-sala-modal',
  standalone: true,
  imports: [CommonModule, PipePreuPipe],
  templateUrl: './sala-modal.component.html'
})
export class SalaModalComponent {

  @Input() sala!: Sales;
  @Input() complements: Complements[] = [];

  @Output() close = new EventEmitter<void>();
}
