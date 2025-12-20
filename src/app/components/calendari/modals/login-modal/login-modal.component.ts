import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Users } from '../../../../models/users.model';
import { UsersService } from '../../../../service/users.service';

@Component({
  selector: 'app-login-modal',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login-modal.component.html'
})
export class LoginModalComponent {

  @Output() logged = new EventEmitter<Users>();
  @Output() close = new EventEmitter<void>();

  loginData = {
    email: '',
    password: ''
  };

  constructor(private usersService: UsersService) {}

  onLoginSubmit() {
    this.usersService
      .getUser(this.loginData.email, this.loginData.password, 'usuari')
      .subscribe(user => {
        if (user?.id) {
          this.logged.emit(
            new Users(
              user.id,
              user.nom,
              user.email,
              user.password,
              user.password
            )
          );
          this.close.emit();
        }
      });
  }
}
