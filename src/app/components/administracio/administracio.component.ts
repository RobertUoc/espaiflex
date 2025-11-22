import { Component, OnInit, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../service/auth.service';
import { Router } from '@angular/router';
import { MenuComponent } from "../menu/menu.component";
import { ComplementsComponent } from '../complements/complements.component';
import { EdificisComponent } from '../edificis/edificis.component';
import { SalesComponent } from '../sales/sales.component';
import { ComentarisComponent } from '../comentaris/comentaris.component';

@Component({
  selector: 'app-administracio',
  imports: [FormsModule, MenuComponent, ComplementsComponent, EdificisComponent, SalesComponent, ComentarisComponent],
  templateUrl: './administracio.component.html',
  styleUrls: ['./administracio.component.css']
})
export class AdministracioComponent implements OnInit {
 selectedOption: string = '';

  constructor(private authService: AuthService, private router: Router ) { }

  ngOnInit() {
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  recibirFormulari(formulari:string) {
    this.selectedOption = formulari;
  }


}
