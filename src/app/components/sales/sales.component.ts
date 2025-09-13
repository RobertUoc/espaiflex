import { Component, OnInit } from '@angular/core';
import { Sales } from '../../models/sales.model';
import { SalesService } from '../../service/sales.service';
import { FormsModule } from '@angular/forms';
import { CommonModule, NgClass, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { config } from '../../models/config';
import { NgxPaginationModule } from 'ngx-pagination';
import { Edificis } from '../../models/edificis.model';
import { EdificisService } from '../../service/edificis.service';
import { Complements } from '../../models/complements.model';
import { ComplementsService } from '../../service/complements.service';
import { PipePreuPipe } from '../../pipe/pipePreu.pipe';

@Component({
  selector: 'app-sales',
  imports: [ FormsModule, NgClass, CommonModule, NgxPaginationModule, PipePreuPipe ],  
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.css']
})
export class SalesComponent implements OnInit {
  public sales = [new Sales()];
  public modalVisible = false;
  public salaSeleccionado = new Sales();  
  public paginaActual: number = 1;
  public edificis = [new Edificis()];
  public complements = [new Complements()];


  
disponibles = [new Complements()];
seleccionados = [new Complements()];

selectedDisponibleId: string | null = null;
selectedSeleccionadoId: string | null = null;

  relaciones: {
    id: number;
    id_sala: number;
    id_complementos: number[];
  }[] = [];

  relacion = {
    id_sala: 0,
    id_complementos: [] as number[]
  };


  constructor(private salesService : SalesService, private EdficisServies: EdificisService, private ComplementsServies: ComplementsService, 
    private http: HttpClient) { }

  ngOnInit() {
    this.getSales();
    this.getEdificis();    
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

  getEdificis() {
    // Provincies
    this.EdficisServies.getEdificis().subscribe({
      next: data => {
          this.edificis = data;
      },
      error: error => {
        console.log(error);
      },
      complete: () => {        
        console.log('Ok');
      }
    });
  }

  obrirModal(id_sala: string) {  
    this.modalVisible = true;
    if (id_sala == '0') {      
      this.salaSeleccionado = new Sales();

      this.salesService.getDisponibles(id_sala).subscribe({
          next: data => {                 
            this.disponibles = data;              
          },
          error: error => {
              console.log(error);
          },      
      });      
      this.seleccionados = [new Complements()];
    }
    else {
      this.salesService.getSala(id_sala).subscribe({
        next: data => {                 
            this.salaSeleccionado = new Sales(data.id,data.descripcio,data.id_edifici,data.nom_edifici,data.preu,data.actiu,data.color,data.missatge);               
        },
        error: error => {
          console.log(error);
        },
        complete: () => {  
          // Disponibles     
          this.salesService.getDisponibles(id_sala).subscribe({
            next: data => {                 
              this.disponibles = data;              
            },
            error: error => {
              console.log(error);
            },
          });
          // Seleccionats
          this.salesService.getSeleccionats(id_sala).subscribe({
            next: data => {                 
              this.seleccionados = data;              
            },
            error: error => {
              console.log(error);
            },
          });
          console.log('Ok');
        }
      });  
    }
  }

  tancarModal() {
    this.modalVisible = false;
  }  

  saveComplement() {    
    if (this.salaSeleccionado.id == '0') {
      // Insert
      console.log('ALTA');            
      let complement  = this.seleccionados.map(item => item.id).join('#');
      this.salesService.insertSala(this.salaSeleccionado.descripcio, this.salaSeleccionado.id_edifici,
        this.salaSeleccionado.preu,                  
        this.salaSeleccionado.color,
        this.salaSeleccionado.missatge,
        this.salaSeleccionado.actiu,
        complement
      ).subscribe(response => {        
//        this.tancarModal();
//        this.getSales();
      });      
      this.tancarModal();
      this.getSales();
      
    }
    else {
      // Update
      let complement = this.seleccionados.map(item => item.id).join('#');
      console.log('UPDATE');            
      this.salesService.putSala(this.salaSeleccionado.id,
        this.salaSeleccionado.descripcio,  this.salaSeleccionado.id_edifici ,this.salaSeleccionado.preu,
        this.salaSeleccionado.color, this.salaSeleccionado.missatge,
        this.salaSeleccionado.actiu,
        complement
      ).subscribe(response => {        
        this.tancarModal();
        this.getSales();
      });
    }    
  }  

  moverADerecha() {
    if (this.selectedDisponibleId !== null) {            
      const item = this.disponibles.find(i => i.id == this.selectedDisponibleId);    
      if (item) {
        this.seleccionados.push(item);        
        this.disponibles = this.disponibles.filter(i => i.id !== item.id);
        this.selectedDisponibleId = null;
      }
    }
  }

  moverAIzquierda() {
    if (this.selectedSeleccionadoId !== null) {
      const item = this.seleccionados.find(i => i.id == this.selectedSeleccionadoId);      
      if (item) {
        this.disponibles.push(item);
        this.seleccionados = this.seleccionados.filter(i => i.id !== item.id);
        this.selectedSeleccionadoId = null;
      }
    }
  }
  
}
