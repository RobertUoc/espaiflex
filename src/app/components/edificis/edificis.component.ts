import { Component, OnInit } from '@angular/core';
import { Edificis } from '../../models/edificis.model';
import { Provincia } from '../../models/provincia.model';
import { EdificisService } from '../../service/edificis.service';
import { ProvinciesService } from '../../service/provincies..service';
import { FormsModule } from '@angular/forms';
import { NgClass, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import e from 'cors';

@Component({
  selector: 'app-edificis',
  imports: [ FormsModule, NgClass, NgIf ],  
  templateUrl: './edificis.component.html',
  styleUrls: ['./edificis.component.css']
})
export class EdificisComponent implements OnInit {
  // Arreglar
  public edificis = [new Edificis('','',0,'','','',0,0,'')];
  public provincies = [new Provincia(0, '')];
  public id_edifici: string = '';
  public modalVisible = false;
  public edificioSeleccionado = new Edificis('','',0,'','','',0,0,'');  
  public selectedFile: File | null = null;
  public uploadedImageUrl: string | null = null;
  public base64: string = '';
  public imagenBase64: string = '';
  public previewUrl: string = '';  

  constructor(private EdificisServeis: EdificisService, private ProvinciesServies: ProvinciesService, private http: HttpClient) { }

  ngOnInit() {
    this.getProvincies();
    this.getEdificis();
  }

  getProvincies() {
    // Provincies
    this.ProvinciesServies.getProvincies().subscribe({
      next: data => {
          this.provincies = data;
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
    // Edificis
    this.EdificisServeis.getEdificis().subscribe({
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

  obrirModal( id_edifici: string) {    
    this.modalVisible = true;    
    if (id_edifici == '0') {      
      this.edificioSeleccionado = new Edificis('','',null,'','SI','',0,0,'');
    }
    else {
      this.EdificisServeis.getEdifici(id_edifici).subscribe({
        next: data => {                 
            this.edificioSeleccionado = new Edificis(data.id,data.nom,data.id_provincia,data.descripcio,data.actiu,'',data.latitud,data.longitud,data.imatge);    
            this.previewUrl = data.imatge;
            this.imagenBase64 = 'data:image/jpeg;base64,' + data.imatge;            
        },
        error: error => {
          console.log(error);
        },
        complete: () => {        
          console.log('Lectura Ok');
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
    this.edificioSeleccionado = new Edificis('','',0,'','','',0,0,'');    
  }

  saveEdifici() {
    const isNew = !this.edificioSeleccionado.id || this.edificioSeleccionado.id == '0';
    if (this.selectedFile) {
      this.edificioSeleccionado.imatge = this.base64;
    }
    if (isNew) {
      this.EdificisServeis.insertEdifici(this.edificioSeleccionado)
        .subscribe(() => {
          this.tancarModal();
          this.getEdificis();
        });
    } else {
      this.EdificisServeis.putEdifici(
        this.edificioSeleccionado.id,
        this.edificioSeleccionado
      ).subscribe(() => {
        this.tancarModal();
        this.getEdificis();
      });
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
