import { Component, OnInit } from '@angular/core';
import { LoginComponent } from '../login/login.component';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgIf, NgFor } from '@angular/common';
import { EdificisService } from '../../service/edificis.service';
import { Sales } from '../../models/sales.model';
import * as L from 'leaflet';
import { Edificis } from '../../models/edificis.model';

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
  public edificis = [new Edificis()];
  dades: string[] = [];
  mostrarModal: boolean = false;
  private map:any;
  private userMarker: L.Marker<any> | undefined;
  
  constructor(private router : Router, private EdificisServeis: EdificisService) {}
  
  ngOnInit() {    
    this.getEdificis(); 
  }

  private initMap() {
    this.map = L.map('map').setView([41.6176, 0.6200], 13);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);
  
  }

  ngAfterViewInit() {
   
  }

  buscar() {
    if (this.poblacion.trim()) {
      // this.router.navigate(['/resultados'], { queryParams: { poblacion: this.poblacion } });      
      this.obtenerEdificios(this.poblacion);      
    }
  }

  getEdificis() {
    // Edificis
    this.EdificisServeis.getEdificis().subscribe({
      next: data => {
          this.edificis = data;
      },
      error: error => {
        console.log(error);
      },
      complete: () => {            
        this.initMap();                        
        this.edificis.forEach(sala => {
          let marcador = L.marker([parseFloat(sala.latitud), parseFloat(sala.longitud)]).addTo(this.map);
          marcador.on('click', () => { this.router.navigate(['/calendari/' + sala.id]); });
        });
        console.log('Carga Ok');
      }
    });
  }


  getLocalizacion() {
      if (navigator.geolocation) {
        const myIcon = L.icon({
          iconUrl:'../../../assets/marker.png', 
          iconSize: [ 25,41 ]
        });
        navigator.geolocation.getCurrentPosition((position) => {
          const coords:[number,number] = [position.coords.latitude, position.coords.longitude];
          if (this.userMarker) { 
            this.userMarker = L.marker(coords ); } else { this.userMarker = L.marker(coords, { icon: myIcon, draggable:true })
            .addTo(this.map)
            .bindPopup('Estas Aqui')
            .openPopup();

            this.userMarker.on('dragend', (event) => {
              const marker = event.target;
              const position = marker.getLatLng();
              marker.setLatLng(position).openPopup();
              this.map.setView(position,19);
              console.log(position);
            })
          }
          this.map.setView(coords, 19);
      }, () => {
          console.log('No lo encuentro');
        });
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
