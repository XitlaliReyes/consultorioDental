import { Routes } from '@angular/router';
import { Home } from './pages/public/home/home';
import { Nosotros } from './pages/public/nosotros/nosotros';
import { Calendario } from './pages/citas/calendario/calendario';

export const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: Home },
    { path: 'nosotros', component: Nosotros },
    { path: 'citas', component: Calendario}
];
