import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-pagina404',
  imports: [ RouterLink ],
  templateUrl: './pagina404.component.html',
  styleUrls: ['./pagina404.component.css']
})
export class Pagina404Component implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
