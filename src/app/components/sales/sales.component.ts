import { Component, OnInit } from '@angular/core';
import { Sales } from '../../models/sales.model';
import { SalesService } from '../../service/sales.service';
import { FormsModule } from '@angular/forms';
import { CommonModule, NgClass, NgIf } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { Edificis } from '../../models/edificis.model';
import { EdificisService } from '../../service/edificis.service';
import { Complements } from '../../models/complements.model';
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
  public edificis:Edificis[] = [];
  
  public complements = [new Complements()];
  public selectedFile: File | null = null;
  public uploadedImageUrl: string | null = null;
  public base64: string = '';
  public imagenBase64: string = '';
  public previewUrl: string = '';    
  public mensajeMovimiento: string = '';
  private mensajeTimeout: any;

  
disponibles = [new Complements()];
seleccionados = [new Complements()];

selectedDisponibleId: number | null = null;
selectedSeleccionadoId: number | null = null;

  relaciones: {
    id: number;
    id_sala: number;
    id_complementos: number[];
  }[] = [];

  relacion = {
    id_sala: 0,
    id_complementos: [] as number[]
  };


  constructor(private salesService : SalesService, private EdficisServies: EdificisService) { }

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

  obrirModal(id_sala: number) {  
    this.modalVisible = true;
    if (id_sala == 0) {            
      this.salesService.getDisponibles(id_sala).subscribe({
          next: data => {                 
            this.disponibles = data;              
          },
          error: error => {
              console.log(error);
          },   
          complete: () => {
              this.seleccionados = [];     
              this.salaSeleccionado = new Sales();         
          }   
      });            
    }
    else {
      this.salesService.getSala(id_sala).subscribe({
        next: data => {                 
            this.salaSeleccionado = new Sales(data.id,data.descripcio,data.id_edifici,data.nom_edifici,data.preu,data.actiu,data.color,data.missatge, data.max_ocupacio, data.horari, data.imatge);               
            this.previewUrl = data.imatge;
            this.imagenBase64 = 'data:image/jpeg;base64,' + data.imatge;
            console.log(this.salaSeleccionado);
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
        }
      });  
    }
  }

  tancarModal() {
    this.modalVisible = false;    
    // 🔥 reset imagen
    this.selectedFile = null;
    this.base64 = '';
    this.previewUrl = '';
    this.imagenBase64 = '';
    // opcional: reset sala
    this.salaSeleccionado = new Sales();    
  }  

  saveComplement() {
    const complementsIds = this.seleccionados.map(item => item.id);
    const isNew = !this.salaSeleccionado.id || this.salaSeleccionado.id == 0;
    // Si hay imagen nueva
    if (this.selectedFile) {
      this.salaSeleccionado.imatge = this.base64;
    }

    if (isNew) {      
      this.salesService
        .insertSala(this.salaSeleccionado, complementsIds)
        .subscribe(() => {
          this.tancarModal();
          this.getSales();
        });

    } else {
      console.log(this.salaSeleccionado.id);
      console.log(this.salaSeleccionado);
      console.log(complementsIds);
      this.salesService
        .updateSala(this.salaSeleccionado.id, this.salaSeleccionado, complementsIds)
        .subscribe(() => {
          this.tancarModal();
          this.getSales();
        });

    }
  }

  private mostrarMensaje(texto: string): void {
    this.mensajeMovimiento = texto;   
    if (this.mensajeTimeout) {
      clearTimeout(this.mensajeTimeout);
    }
    this.mensajeTimeout = setTimeout(() => {
      this.mensajeMovimiento = '';
    }, 3000); 
  }

  moverADerecha() {    
    if (this.selectedDisponibleId == null) {
        this.mostrarMensaje('Debe seleccionar un complemento disponible.');
        return;
    }    
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
    if (this.selectedSeleccionadoId === null) {
        this.mostrarMensaje('Debe seleccionar un complemento seleccionado.');
        return;
    }    
    if (this.selectedSeleccionadoId !== null) {
      const item = this.seleccionados.find(i => i.id == this.selectedSeleccionadoId);      
      if (item) {
        this.disponibles.push(item);
        this.seleccionados = this.seleccionados.filter(i => i.id !== item.id);
        this.selectedSeleccionadoId = null;
      }
    }
  }
  
  onFileSeleccionada(event: any): void {
    const file = event.target.files?.[0];
    if (!file) return;
    this.selectedFile = file;
    const reader = new FileReader();
    reader.onload = () => {
      this.base64 = reader.result as string;
      this.previewUrl = this.base64;
      console.log('BASE64 generado:', this.base64);
    };
    reader.onerror = (error) => {
      console.error('Error leyendo archivo:', error);
    };
    reader.readAsDataURL(file);
  }

}
