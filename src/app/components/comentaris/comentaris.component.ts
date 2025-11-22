import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule, NgClass, NgIf } from '@angular/common';
import { ComentariService } from '../../service/comentaris.service';
import { Comentaris } from '../../models/comentaris.model';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { Sales } from '../../models/sales.model';
import { SalesService } from '../../service/sales.service';
import { Chart } from 'chart.js/auto';

@Component({
  selector: 'app-comentaris',
  templateUrl: './comentaris.component.html',
  imports: [CommonModule, FormsModule, NgxPaginationModule],
  styleUrls: ['./comentaris.component.css'],
})
export class ComentarisComponent {
  comentarios: Comentaris[] = [];
  filtroSala: string = '0';
  filtroUsuario: string = '';
  public paginaActual: number = 1;
  public sales = [new Sales()];
  public grafico: any;

  constructor(
    private comentariService: ComentariService,
    private salesService: SalesService
  ) {}

  ngOnInit() {
    this.comentariService.getComentarios().subscribe((data) => {
      this.comentarios = data.sort((a, b) => {
        if (a.nom === b.nom) {
          return new Date(a.creat).getTime() - new Date(b.creat).getTime();
        }
        return a.nom.localeCompare(b.nom);
      });
    });
    this.getSales();
    this.creaGrafico();
  }

  getSales() {
    // Complements
    this.salesService.getSales().subscribe({
      next: (data) => {
        this.sales = data;
      },
      error: (error) => {
        console.log(error);
      },
      complete: () => {
        console.log('Ok');
        // this.actualizarGrafico(this.getComentariosFiltrados());
      },
    });
  }
  getComentariosFiltrados() {
    let filtrados = this.comentarios.filter((c) => {
      let coincideSala =
        this.filtroSala === '0' || c.descripcio.includes(this.filtroSala);
      let coincideUsuario =
        this.filtroUsuario === '' || c.nom.includes(this.filtroUsuario);
      return coincideSala && coincideUsuario;
    });
    this.actualizarGrafico(filtrados);
    return filtrados;
  }

  creaGrafico() {
    this.grafico = new Chart('general', {
      type: 'bar',
      data: {
        labels: [
          'Sin Puntuar',
          'Un Punto',
          'Dos Puntos',
          'Tres Puntos',
          'Cuatro Puntos',
          'Cinco Puntos',
        ],
        datasets: [
          {
            label: 'Puntuaciones',
            data: [0, 0, 0, 0, 0, 0],
            backgroundColor: ['green', 'red', 'blue', 'yellow', 'pink', 'orange'],
          },
        ],
      },
    });    
  }

  actualizarGrafico(filtrats: Comentaris[]) {
    const cero = filtrats.filter((c) => c.puntuacio == 0).length;
    const uno = filtrats.filter((c) => c.puntuacio == 1).length;
    const dos = filtrats.filter((c) => c.puntuacio == 2).length;
    const tres = filtrats.filter((c) => c.puntuacio == 3).length;
    const cuatro = filtrats.filter((c) => c.puntuacio == 4).length;
    const cinco = filtrats.filter((c) => c.puntuacio == 5).length;
    this.grafico.data.datasets[0].data = [cero, uno, dos, tres, cuatro, cinco];           
    this.grafico.update();    
  }
}
