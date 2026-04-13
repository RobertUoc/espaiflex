import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Users } from '../../../../models/users.model';
import { UsersService } from '../../../../service/users.service';
import { AuthService } from '../../../../service/auth.service';

@Component({
  selector: 'app-login-modal',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login-modal.component.html'
})

export class LoginModalComponent {

  @Output() logged = new EventEmitter<Users>();
  @Output() close = new EventEmitter<void>();
  @Output() registrarse = new EventEmitter<void>();
  
  public loginError:string = '';

  loginData = {
    email: '',
    password: ''
  };

  constructor(private usersService: UsersService, private authService: AuthService) {}


    onLoginSubmit() {
      console.log(localStorage);
      this.loginError = '';
      this.authService.loginUser(
        this.loginData.email,
        this.loginData.password
      ).subscribe({
        next: (response) => {        
          localStorage.setItem('token', response.token);
          localStorage.setItem('role', response.user.role);
          localStorage.setItem('userId', response.user.id.toString());
          localStorage.setItem('user', 'user');     
          const userModel = new Users(
            response.user.id,
            response.user.name,
            response.user.email,
            '', 
            'user' 
          );
          console.log(localStorage);
          this.logged.emit(userModel);
          this.close.emit();
        },
        error: (err) => {
          if (err.status === 401) {
            this.loginError = 'Correo o contraseña incorrectos';
          }
        }
      });
  }  

}
