import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../service/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [ FormsModule ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit {
  user : string = 'ceinvde@infonegocio.com';
  password : string = '1234';

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit() {
  }

  onSubmit() {    
    this.authService.login(this.user, this.password).subscribe((isAuthenticated) => {
      if (isAuthenticated) {
        this.router.navigate(['/admin']);
      } else {        
        console.log('Error en credenciales');
      }
    });    
  }

}
