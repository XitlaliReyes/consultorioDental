import { Routes } from '@angular/router';
import { Home } from './pages/public/home/home';
import { Nosotros } from './pages/public/nosotros/nosotros';
import { Calendario } from './pages/citas/calendario/calendario';
import { Login } from './pages/public/login/login';
import { CallbackComponent } from './pages/callback/callback';
import { Onboarding } from './pages/onboarding/onboarding';
import { AuthGuard } from './guards/auth.guard';
import { CitasMedico } from './pages/citas/citas-medico/citas-medico';

export const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'login', component: Login},
    { path: 'nosotros', component: Nosotros },
    { path: 'citas', component: Calendario},
    
      {
        path: 'callback',
        component: CallbackComponent
      },
      {
        path: 'onboarding',
        component: Onboarding,
        canActivate: [AuthGuard]
      },
      {
        path: 'home',
        loadComponent: () => import('./pages/public/home/home').then(m => m.Home),
        canActivate: [AuthGuard]
      },
      {
        path: 'dashboard-medico',
        loadComponent: () => import('./pages/dashboard-medico/dashboard-medico').then(m => m.DashboardMedicoComponent),
        canActivate: [AuthGuard]
      },
      
      {
        path: 'citas-medico',
        component: CitasMedico,
        canActivate: [AuthGuard]
      },
      {
        path: '**',
        redirectTo: '/login'
      }
];
