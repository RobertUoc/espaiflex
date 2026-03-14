import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComentariService } from '../../service/comentaris.service';
import { Comentaris } from '../../models/comentaris.model';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { Sales } from '../../models/sales.model';
import { SalesService } from '../../service/sales.service';
import { Chart } from 'chart.js/auto';

@Component({
  selector: 'app-comentaris',
  standalone: true,
  templateUrl: './comentaris.component.html',
  styleUrls: ['./comentaris.component.css'],
  imports: [CommonModule, FormsModule, NgxPaginationModule],
})
export class ComentarisComponent implements OnInit {
  comentarios: Comentaris[] = [];
  comentariosFiltrados: Comentaris[] = [];
  filtroSala: string = '0';
  filtroUsuario: string = '';
  paginaActual = 1;
  sales: Sales[] = [];
  grafico!: Chart;

  constructor(private comentariService: ComentariService, private salesService: SalesService) {}

  ngOnInit(): void {
    this.loadComentarios();
    this.loadSales();
  }

  private loadComentarios(): void {
    this.comentariService.getComentarios().subscribe((data) => {
      this.comentarios = data.sort((a, b) => {
        if (a.nom === b.nom) {
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        }
        return a.nom.localeCompare(b.nom);
      });
      this.applyFilters();
      this.createOrUpdateChart();
    });
  }

  private loadSales(): void {
    this.salesService.getSales().subscribe({
      next: (data) => (this.sales = data),
      error: (err) => console.error(err),
    });
  }

  applyFilters(): void {
    this.comentariosFiltrados = this.comentarios.filter((c) => {
      const salaOk = this.filtroSala === '0' || c.descripcio.includes(this.filtroSala);
      const usuarioOk =  !this.filtroUsuario || c.nom.toLowerCase().includes(this.filtroUsuario.toLowerCase());
      return salaOk && usuarioOk;
    });
    this.updateChartData();
  }

  private createOrUpdateChart(): void {
    const ctx = document.getElementById('comentariosChart') as HTMLCanvasElement;
    this.grafico = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: [
          'Sin puntuar',
          '1 punto',
          '2 puntos',
          '3 puntos',
          '4 puntos',
          '5 puntos',
        ],
        datasets: [
          {
            label: 'Puntuaciones',
            data: [0, 0, 0, 0, 0, 0],
            backgroundColor: [
              '#6c757d',
              '#dc3545',
              '#fd7e14',
              '#ffc107',
              '#198754',
              '#0d6efd',
            ],
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { precision: 0 },
          },
        },
      },
    });
    this.updateChartData();
  }

  private updateChartData(): void {
    if (!this.grafico) return;
    const counts = [0, 0, 0, 0, 0, 0];
    this.comentariosFiltrados.forEach((c) => {
      const p = Number(c.puntuacio);
      if (p >= 0 && p <= 5) { counts[p]++; }
    });
    this.grafico.data.datasets[0].data = counts;
    this.grafico.update();
  }
}
