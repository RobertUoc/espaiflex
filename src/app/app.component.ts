import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { config } from './models/config';
import { AuthService } from './service/auth.service';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = config.title;

constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.loginVisitant();
  }

  loginVisitant() {
    this.authService.login('visitant@admin.com', '654321').subscribe({
      next: (response) => {
        console.log('ok');
      },
      error: (err) => {
        console.error('Error en login visitante', err);
      }
    });
  }


}
