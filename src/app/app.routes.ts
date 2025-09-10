import { Routes } from '@angular/router';
import { Home } from './pages/public/home/home';
import { Login } from './pages/public/login/login';

export const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: Home },
    { path: 'login', component: Login }
];
