import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { CalendariComponent } from './components/calendari/calendari.component';
import { AuthGuard } from './models/auth.guard';
import { Pagina404Component } from './components/pagina404/pagina404/pagina404.component';

export const routes: Routes = [
    { path: "", component: HomeComponent },    
    { path: "home", component: HomeComponent },    
    { path: "calendari/:id", component: CalendariComponent },
    { path: "admin",         
            loadChildren: () =>
            import('./components/administracio/administracio.module').then(m => m.AdministracioModule),        
            canActivate: [AuthGuard] 
    },
    { path: "**", component: Pagina404Component },   
];

