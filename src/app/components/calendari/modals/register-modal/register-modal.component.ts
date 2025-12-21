import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Users } from '../../../../models/users.model';
import { UsersService } from '../../../../service/users.service';

@Component({
  selector: 'app-register-modal',
  standalone: true,
  imports: [FormsModule, NgIf ],
  templateUrl: './register-modal.component.html'
})
export class RegisterModalComponent {
  @Input() user: Users | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<Users>();

  registerData = new Users();
  finestra = 1; // 1 = insert, 3 = update

  constructor(private userService: UsersService) { }

  ngOnInit(): void {
    if (this.registerData.id == '0') {
      this.registerData.nom = '';
      this.registerData.email = '';
      this.registerData.password = '';    
      this.registerData.confirm = '';
    }
  }

  ngOnChanges() {
    if (this.user) {      
      this.registerData = { ...this.user };
    }
  }

  onRegisterSubmit() {
    const action$ = this.isUpdate()
      ? this.userService.putUser(
          this.registerData.id,
          this.registerData.nom,
          this.registerData.email,
          this.registerData.password
        )
      : this.userService.insertUser(
          this.registerData.nom,
          this.registerData.email,
          this.registerData.password
        );
  
    action$.subscribe(() => {
      this.saved.emit(this.registerData); 
      this.close.emit();
    });
  }
  

  onRegisterSubmit2() {
    if (this.registerData.id === '0') {
      this.userService.insertUser(
        this.registerData.nom,
        this.registerData.email,
        this.registerData.password
      ).subscribe(() => this.close.emit());
    } else {
      this.userService.putUser(
        this.registerData.id,
        this.registerData.nom,
        this.registerData.email,
        this.registerData.password
      ).subscribe(() => this.close.emit());
    }
  }

  passwordsMatch(): boolean {
    return this.registerData.password === this.registerData.confirm;
  }

  isUpdate(): boolean {
    return !!this.registerData?.id && this.registerData.id !== '0';
  }  
}
