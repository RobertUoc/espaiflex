import { Component, OnInit } from '@angular/core';
import { Complements } from '../../models/complements.model';
import { ComplementsService } from '../../service/complements.service';
import { FormsModule } from '@angular/forms';
import { CommonModule, NgClass, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { config } from '../../models/config';
import { NgxPaginationModule } from 'ngx-pagination';
import { PipePreuPipe } from '../../pipe/pipePreu.pipe';


@Component({
  selector: 'app-complements',
  imports: [ FormsModule, NgClass, CommonModule, NgxPaginationModule, PipePreuPipe ],  
  templateUrl: './complements.component.html',
  styleUrls: ['./complements.component.css']
})
export class ComplementsComponent implements OnInit {
  public complements = [new Complements()];
  public modalVisible = false;
  public complementSeleccionado = new Complements();  
  public paginaActual: number = 1;


  constructor(private complementsService : ComplementsService, private http: HttpClient) { }

  ngOnInit() {
    this.getComplements();
  }

  getComplements() {
    // Complements
    this.complementsService.getComplements().subscribe({
      next: data => {
          this.complements = data;
      },
      error: error => {
        console.log(error);
      },
      complete: () => {        
        console.log('Ok');
      }
    });
  }

  obrirModal(id_complement: string) {  
    this.modalVisible = true;
    if (id_complement == '0') {      
      this.complementSeleccionado = new Complements();
    }
    else {
      this.complementsService.getComplement(id_complement).subscribe({
        next: data => {                 
            this.complementSeleccionado = new Complements(data.id,data.descripcio,data.preu,data.actiu);    
        },
        error: error => {
          console.log(error);
        },
        complete: () => {        
          console.log('Ok');
        }
      });  
    }
  }

  tancarModal() {
    this.modalVisible = false;
  }  

  saveComplement() {    
    if (this.complementSeleccionado.id == '0') {
      // Insert
      console.log('ALTA');            
      this.complementsService.insertComplement(this.complementSeleccionado.descripcio,  this.complementSeleccionado.preu,                  
        this.complementSeleccionado.actiu
      ).subscribe(response => {        
        this.tancarModal();
        this.getComplements();
      });
    }
    else {
      // Update
      this.complementsService.putComplement(this.complementSeleccionado.id,
        this.complementSeleccionado.descripcio,  this.complementSeleccionado.preu,
        this.complementSeleccionado.actiu
      ).subscribe(response => {        
        this.tancarModal();
        this.getComplements();
      });
    }    
  }  
  
}
