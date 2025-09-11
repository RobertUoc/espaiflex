import { Component, OnInit } from '@angular/core';
import { Edificis } from '../../models/edificis.model';
import { Provincia } from '../../models/provincia.model';
import { EdificisService } from '../../service/edificis.service';
import { ProvinciesService } from '../../service/provincies..service';
import { FormsModule } from '@angular/forms';
import { NgClass, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { config } from '../../models/config';

@Component({
  selector: 'app-edificis',
  imports: [ FormsModule, NgClass, NgIf ],  
  templateUrl: './edificis.component.html',
  styleUrls: ['./edificis.component.css']
})
export class EdificisComponent implements OnInit {
  // Arreglar
  public edificis = [new Edificis()];
  public provincies = [new Provincia(0, '')];
  public id_edifici: string = '';
  public modalVisible = false;
  public edificioSeleccionado = new Edificis();  
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
      this.edificioSeleccionado = new Edificis();
    }
    else {
      this.EdificisServeis.getEdifici(id_edifici).subscribe({
        next: data => {                 
            this.edificioSeleccionado = new Edificis(data.id,data.nom,data.id_provincia,data.imatge,data.descripcio,data.actiu);    
            this.previewUrl = data.imatge;
            this.imagenBase64 = 'data:image/jpeg;base64,' + data.imatge;
            console.log(this.edificioSeleccionado);
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
  }

  saveEdifici() {    
    if (this.edificioSeleccionado.id == '0') {
      // Insert
      if (!this.selectedFile) {
        this.base64 = this.previewUrl;
        console.log('insert selected');
      }
      console.log('ALTA');            
      this.EdificisServeis.insertEdifici(this.edificioSeleccionado.nom,
        this.edificioSeleccionado.id_provincia,
        this.base64,
        this.edificioSeleccionado.descripcio,
        this.edificioSeleccionado.actiu
      ).subscribe(response => {        
        this.tancarModal();
        this.getEdificis();
      });
    }
    else {
      // Update
      if (!this.selectedFile) {      
        this.base64 = this.previewUrl;
        console.log('update selected')
      }      

      this.EdificisServeis.putEdifici(this.edificioSeleccionado.id,
        this.edificioSeleccionado.nom,
        this.edificioSeleccionado.id_provincia,
        this.base64,
        this.edificioSeleccionado.descripcio,
        this.edificioSeleccionado.actiu,        
      ).subscribe(response => {        
        this.tancarModal();
        this.getEdificis();
      });
    }    
  }

  onFileSeleccionada(event: any): void {
    this.selectedFile = event.target.files[0];  
    let nom_file = this.selectedFile?.name;
    if (this.selectedFile) {            
      const reader = new FileReader();      
      reader.onload = (e: any) => {
        this.previewUrl = e.target.result;        
        this.base64 = reader.result as string;
      };
      reader.readAsDataURL(this.selectedFile);      
    }
  }

}
