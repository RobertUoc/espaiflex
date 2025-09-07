import { NgModule } from '@angular/core';
import { CommonModule,  } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdministracioComponent } from './administracio.component';

@NgModule({
  imports: [       
    CommonModule, RouterModule.forChild([{ path : '', component: AdministracioComponent}])    
  ],
})

export class AdministracioModule { 
  

}