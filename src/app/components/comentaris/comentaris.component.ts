import { Component, OnInit } from '@angular/core';
import { CommonModule, NgClass, NgIf } from '@angular/common';
import { ComentariService } from '../../service/comentaris.service';
import { Comentaris } from '../../models/comentaris.model';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { Sales } from '../../models/sales.model';
import { SalesService } from '../../service/sales.service';

@Component({
  selector: 'app-comentaris',
  templateUrl: './comentaris.component.html',
  imports: [ CommonModule, FormsModule, NgxPaginationModule ],  
  styleUrls: ['./comentaris.component.css']
})
export class ComentarisComponent implements OnInit {
  comentarios: Comentaris[] = [];
  filtroSala: string = '0';
  filtroUsuario: string = '';
  public paginaActual: number = 1;
  public sales = [new Sales()];

  constructor(private comentariService : ComentariService,private salesService : SalesService,) { }


  ngOnInit() {
    this.comentariService.getComentarios().subscribe(data => {      
      this.comentarios = data.sort((a, b) => {
        if (a.nom === b.nom) {
          return new Date(a.creat).getTime() - new Date(b.creat).getTime();
        }
        return a.nom.localeCompare(b.nom);
      });
    });  
    this.getSales();  
  }

  getSales() {
    // Complements
    this.salesService.getSales().subscribe({
      next: data => {
          this.sales = data;
      },
      error: error => {
        console.log(error);
      },
      complete: () => {        
        console.log('Ok');
      }
    });
  }    
  getComentariosFiltrados() {
    return this.comentarios.filter(c => {
      let coincideSala = this.filtroSala === '0' || c.descripcio.includes(this.filtroSala);
      let coincideUsuario = this.filtroUsuario === '' || c.nom.includes(this.filtroUsuario);
      return coincideSala && coincideUsuario;        
    });
  }  
}
