import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PipeFechaPipe } from '../../../../pipe/pipeFecha.pipe';

@Component({
  selector: 'app-mostrar-dia-modal',
  standalone: true,
  imports: [CommonModule, PipeFechaPipe],
  templateUrl: './mostrar-dia-modal.component.html'
})
export class MostrarDiaModalComponent {

  @Input() dia!: string;
  @Input() miraDia: any[] = [];

  @Output() close = new EventEmitter<void>();

  getHoraClass(estado: string): string {
    return estado === 'No informado'
      ? 'bg-success'
      : 'bg-danger';
  }
}
