import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PipePreuPipe } from '../../../../pipe/pipePreu.pipe';
import { PipeFechaPipe } from '../../../../pipe/pipeFecha.pipe';
import { FacturaDetalle, Factures } from '../../../../models/factura.model';

@Component({
  selector: 'app-factura-modal',
  standalone: true,
  imports: [CommonModule, PipePreuPipe, PipeFechaPipe],
  templateUrl: './factura-modal.component.html'
})
export class FacturaModalComponent {

  @Input() visible: boolean = false;
  @Input() factura?: FacturaDetalle;

  @Output() close = new EventEmitter<void>();

  tancarModal() {
    this.close.emit();
  }
}