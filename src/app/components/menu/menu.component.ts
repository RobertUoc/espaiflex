import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';

declare var bootstrap: any;
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
    this.closeMenu();
    this.selectedOption.emit(option);    
  }

  logout() {  
    this.router.navigate(['/']);
  }

  closeMenu() {
    const menu = document.getElementById('adminMenu');
    if (menu) {
      const bsCollapse = bootstrap.Collapse.getInstance(menu);
      if (bsCollapse) {
        bsCollapse.hide();
      }
    }
  }  
}
