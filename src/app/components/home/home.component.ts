import { Component, OnInit } from '@angular/core';
import { LoginComponent } from '../login/login.component';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgIf, NgFor } from '@angular/common';
import { EdificisService } from '../../service/edificis.service';

interface Edifici {
  provincia: string;
  id: string;
  nom: string;
  imatge: string;
}

@Component({
  selector: 'app-home',
  imports: [ LoginComponent, FormsModule, NgIf, NgFor, ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent implements OnInit { 
  poblacion: string = '';
  edificios: Edifici[] = [];     
  dades: string[] = [];
  mostrarModal: boolean = false;
  
  constructor(private router : Router, private EdificisServeis: EdificisService) {}
  
  ngOnInit() {    
  }

  buscar() {
    if (this.poblacion.trim()) {
      // this.router.navigate(['/resultados'], { queryParams: { poblacion: this.poblacion } });      
      this.obtenerEdificios(this.poblacion);      
    }
  }

  obtenerEdificios(poblacion: string) {        
    this.EdificisServeis.getProvincies(poblacion).subscribe({
      next: data => {
          this.edificios = data;          
      },
      error: error => {
        console.log(error);
      },
      complete: () => {                     
        this.mostrarModal = true;
      }
    });
  }

  cerrarModal() {
    this.mostrarModal = false;
  }

  irAlCalendario(id_edifici:string) {
    this.router.navigate(['/calendari/' + id_edifici]);
  }


}
