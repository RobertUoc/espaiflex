import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Factures } from '../../models/factura.model';
import { Chart } from 'chart.js/auto';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { FacturesService } from '../../service/factures.service';
import { PipePreuPipe } from '../../pipe/pipePreu.pipe';
import { FacturaModalComponent } from './modals/factura-modal/factura-modal.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-factures',
  standalone: true,
  templateUrl: './factures.component.html',
  styleUrl: './factures.component.scss',
  imports: [CommonModule, FormsModule, NgxPaginationModule, PipePreuPipe, FacturaModalComponent],
})

export class FacturesComponent implements OnInit
{    
    public factures: Factures[] = [];
    public modalVisible = false;
    public paginaActual: number = 1
    public grafico!: Chart;    
    public facturaSeleccionada?: Factures;
    public facturaDetalle?: Factures;

    public anios: number[] = [];
    public meses = [
      { value: 1, label: 'Enero' },
      { value: 2, label: 'Febrero' },
      { value: 3, label: 'Marzo' },
      { value: 4, label: 'Abril' },
      { value: 5, label: 'Mayo' },
      { value: 6, label: 'Junio' },
      { value: 7, label: 'Julio' },
      { value: 8, label: 'Agosto' },
      { value: 9, label: 'Septiembre' },
      { value: 10, label: 'Octubre' },
      { value: 11, label: 'Noviembre' },
      { value: 12, label: 'Diciembre' }
    ];

    public anioSeleccionado: number = 0;
    public mesSeleccionado: number = 0;    

    constructor(private facturesService: FacturesService) {}
  
    ngOnInit(): void {
      this.getFactures();    
      this.loadAnios();
    }
  
    getFactures() {
      // Complements
      this.facturesService.getFactures().subscribe({
        next: data => {
            this.factures = data;
        },
        error: error => {
          console.log(error);
        },
        complete: () => {        
          console.log('Ok');
        }
      });
    }

    verFactura(id: number) {
      this.facturesService.getFactura(id).subscribe(data => {
        this.facturaDetalle = data;
        this.modalVisible = true;
        console.log('ver');
      });
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

    enviarFacturaEmail(id: number) {
      this.facturesService.enviarFacturaEmail(id)
        .subscribe({
          next: () => {            
            this.mostrarAlertes('Envío correcto', 'La factura ha sido enviada al cliente.', 'success', 'Aceptar');
            this.getFactures();
          },
          error: err => console.error(err)
        });
    }

    tancarModal() {
      this.modalVisible = false;
    }  

    loadAnios() {
      this.facturesService.getAnios().subscribe(data => {
        this.anios = data;        
      });
    }

    onFiltroChange() {
      if (!this.anioSeleccionado) return;
      // Año completo → mostrar por meses
      if (this.mesSeleccionado == 0) {
        this.facturesService
          .getFacturacionPorMes(this.anioSeleccionado)
          .subscribe(data => {            
            this.createChart(
               data.map(d =>this.meses.find(m => Number(m.value) == Number(d.mes))?.label ?? '' ), 
               data.map(d => d.total)
            );
          });

      } 
      // Año + mes → mostrar por días
      else {
        this.facturesService
          .getFacturacionPorDia(this.anioSeleccionado, this.mesSeleccionado)
          .subscribe(data => {            
            this.createChart(
              data.map(d => `Día ${d.dia}`),
              data.map(d => d.total)
            );
          });
      }
    }   

    createChart(labels: string[], values: number[]) {

      if (this.grafico) {
        this.grafico.destroy();
      }

      const ctx = document.getElementById('facturasChart') as HTMLCanvasElement;

      this.grafico = new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'Facturación (€)',
            data: values,
            backgroundColor: '#0d6efd'
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } }
        }
      });
    }

    exportarCSV(): void {
        if (!this.factures || this.factures.length === 0) {
          this.mostrarAlertes(
            'Sin datos',
            'No hay facturas para exportar.',
            'warning',
            'Aceptar'
          );
          return;
        }
        const headers = [
          'Reserva',
          'Número Factura',
          'Usuario',
          'Fecha',
          'Base',
          'IVA',
          'Importe IVA',
          'Total'
        ];

      const rows = this.factures.map(f => [
        f.nom_sala,
        f.id,
        f.nom_user,
        f.data_factura,
        f.base,
        f.iva,
        f.iva_import,
        f.total_factura
      ]);

      const csvContent =
        [headers, ...rows]
          .map(e => e.map(v => `"${v ?? ''}"`).join(';'))
          .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'facturas.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

  }

}
