import { Component, OnInit } from '@angular/core';
import { LoginComponent } from '../login/login.component';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgIf, NgFor } from '@angular/common';
import { EdificisService } from '../../service/edificis.service';
import * as L from 'leaflet';
import { Edificis } from '../../models/edificis.model';
import { AuthService } from '../../service/auth.service';

interface Edifici {
  provincia: string;
  id: string;
  nom: string;
  imatge: string;
}

const customIcon = L.icon({
  iconUrl: 'assets/marker.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  shadowUrl: 'assets/marker-shadow.png'
});  

@Component({
  selector: 'app-home',
  imports: [ LoginComponent, FormsModule, NgIf, NgFor ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent implements OnInit { 
  poblacion: string = '';
  edificios: Edificis[] = [];     
  public edificis = [new Edificis('','',0,'','','',0,0,'')];
  dades: string[] = [];
  mostrarModal: boolean = false;
  private map:any;
  private userMarker: L.Marker<any> | undefined;
  geoDisponible: boolean = true;
  defaultCoords: [number, number] = [41.6176, 0.6200];
  
  constructor(private authService: AuthService, private router : Router, private EdificisServeis: EdificisService) {}
  
  ngOnInit() {    
    this.loginVisitant();
    this.getEdificis();    
  }

  private initMap() {
   this.map = L.map('map').setView(this.defaultCoords, 13);
    L.tileLayer(
      'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        attribution: '&copy; OpenStreetMap'
      }
    ).addTo(this.map);    
    L.marker(this.defaultCoords, { icon: customIcon })
      .addTo(this.map)
      .bindPopup('Ubicació predeterminada')
      .openPopup();
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
          console.log(data);
          this.edificis = data;
      },
      error: error => {
        console.log(error);
      },
      complete: () => {            
        this.initMap();                        
        this.edificis.forEach(sala => {          
          let marcador = L.marker([sala.latitud, sala.longitud],{ icon: customIcon }).addTo(this.map);
          marcador.on('click', () => { this.router.navigate(['/calendari/' + sala.id]); });
        });
        console.log('Carga Ok');
      }
    });
  }


  getLocalizacion() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const coords: [number, number] = [
              position.coords.latitude,
              position.coords.longitude
            ];
            const myIcon = L.icon({
              iconUrl: 'assets/marker.png',
              iconSize: [25, 41]
            });            
            if (this.userMarker) {
              this.map.removeLayer(this.userMarker);
            }
            this.userMarker = L.marker(coords, {
              icon: myIcon,
              draggable: true
            })
            .addTo(this.map)
            .bindPopup('Estàs aquí')
            .openPopup();
            this.userMarker.on('dragend', (event: any) => {
              const marker = event.target;
              const position = marker.getLatLng();
              marker.setLatLng(position).openPopup();
              this.map.setView(position, 16);
            });
            this.map.setView(coords, 16);
            this.geoDisponible = true;
          },
          (error) => {
            console.log('Geolocalització no disponible', error);
            this.geoDisponible = false;            
            this.map.setView(this.defaultCoords, 13);
          }
        );
      } else {
        this.geoDisponible = false;
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

  loginVisitant() {
    this.authService.login('visitant@admin.com', '654321').subscribe({
      next: (response) => {
        console.log('ok');
      },
      error: (err) => {
        console.error('Error en login visitante', err);
      }
    });
  }

}
