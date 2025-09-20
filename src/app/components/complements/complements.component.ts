import { Component, OnInit } from '@angular/core';
import { Complements } from '../../models/complements.model';
import { ComplementsService } from '../../service/complements.service';
import { CommonModule, NgClass } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { NgxPaginationModule } from 'ngx-pagination';
import { PipePreuPipe } from '../../pipe/pipePreu.pipe';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';


@Component({
  selector: 'app-complements',
  imports: [ NgClass, CommonModule, NgxPaginationModule, PipePreuPipe, ReactiveFormsModule ],  
  templateUrl: './complements.component.html',
  styleUrls: ['./complements.component.css']
})
export class ComplementsComponent implements OnInit {
  public complements = [new Complements()];
  public modalVisible = false;
  public paginaActual: number = 1;
  public complement!: FormGroup;

  constructor(private fb: FormBuilder, private complementsService : ComplementsService, private http: HttpClient) { 
    this.createForm();
  }

  ngOnInit() {
    this.getComplements();    
  }

  createForm() {
    this.complement = this.fb.group({
      id: ['0'],
      descripcio: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      preu: ['0', [Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      actiu: ['SI']
    });    
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
    this.complement.patchValue({
      id:'0',
      descripcio:'',
      preu:'0',
      actiu:'SI'
    })    
    if (id_complement != '0') {      
      this.complementsService.getComplement(id_complement).subscribe({
        next: data => {                             
            this.complement.patchValue({
              id:data.id,
              descripcio:data.descripcio,
              preu:data.preu,
              actiu:data.actiu
            })
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
    if (this.complement.value.id == '0') {
      // Insert                
      this.complementsService.insertComplement(this.complement.value.descripcio, this.complement.value.preu, this.complement.value.actiu
      ).subscribe(response => {        
        this.tancarModal();
        this.getComplements();
      });
    }
    else {
      // Update      
      this.complementsService.putComplement(this.complement.value.id, this.complement.value.descripcio, this.complement.value.preu, this.complement.value.actiu
      ).subscribe(response => {        
        this.tancarModal();
        this.getComplements();
      });
    }    
  }  
  
}
