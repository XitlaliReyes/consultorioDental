import { Routes } from '@angular/router';
import { Home } from './pages/public/home/home';
import { Nosotros } from './pages/public/nosotros/nosotros';
import { Calendario } from './pages/citas/calendario/calendario';
import { Login } from './pages/public/login/login';
import { CallbackComponent } from './pages/callback/callback';
import { Onboarding } from './pages/onboarding/onboarding';
import { AuthGuard, MedicoGuard, PacienteGuard } from './guards/auth.guard';
import { CitasMedico } from './pages/citas/citas-medico/citas-medico';

// Importar todos los guards del mismo archivo

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'nosotros', component: Nosotros },
  { path: 'callback', component: CallbackComponent },
  
  // ========== RUTAS DE ONBOARDING ==========
  {
    path: 'onboarding',
    component: Onboarding,
    canActivate: [AuthGuard]
  },
  
  // ========== RUTAS DE PACIENTES ==========
  {
    path: 'home',
    loadComponent: () => import('./pages/public/home/home').then(m => m.Home),
    canActivate: [AuthGuard, PacienteGuard] // Solo pacientes
  },
  {
    path: 'citas',
    component: Calendario,
    canActivate: [AuthGuard, PacienteGuard] // Solo pacientes
  },
  
  // ========== RUTAS DE MÉDICOS ==========
  {
    path: 'dashboard-medico',
    loadComponent: () => import('./pages/dashboard-medico/dashboard-medico').then(m => m.DashboardMedicoComponent),
    canActivate: [AuthGuard, MedicoGuard] // Solo médicos
  },
  {
    path: 'citas-medico',
    component: CitasMedico,
    canActivate: [AuthGuard, MedicoGuard] // Solo médicos
  },
  {
    path: 'historial-clinico/:idPaciente',
    loadComponent: () => import('./pages/historial-clinico/historial-clinico').then(m => m.HistorialClinico),
    canActivate: [AuthGuard, MedicoGuard] // Solo médicos
  },
  
  { path: '**', redirectTo: '/login' }
];
