import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {
  @Output() selectedOption = new EventEmitter;

  constructor(private router: Router) { }

  ngOnInit() {
  }

  selectOption(option: string) {    
    this.selectedOption.emit(option);    
  }

  logout() {  
    this.router.navigate(['/']);
  }

}
