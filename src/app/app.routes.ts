import { Routes } from '@angular/router';
import { Home } from './pages/public/home/home';
import { Nosotros } from './pages/public/nosotros/nosotros';
import { Calendario } from './pages/citas/calendario/calendario';
import { Login } from './pages/public/login/login';
import { CallbackComponent } from './pages/callback/callback';
import { Onboarding } from './pages/onboarding/onboarding';
import { AuthGuard, MedicoGuard, PacienteGuard } from './guards/auth.guard';
import { CitasMedico } from './pages/citas/citas-medico/citas-medico';

export const routes: Routes = [
  // Redirige a home sin requerir login
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  
  // ========== RUTAS PÚBLICAS (SIN GUARDS) ==========
  { path: 'login', component: Login },
  { path: 'nosotros', component: Nosotros },
  { path: 'callback', component: CallbackComponent },
  
  // HOME - Accesible sin login
  {
    path: 'home',
    loadComponent: () => import('./pages/public/home/home').then(m => m.Home)
  },
  
  // ========== RUTAS DE ONBOARDING ==========
  {
    path: 'onboarding',
    component: Onboarding,
    canActivate: [AuthGuard]
  },
  
  // ========== RUTAS DE PACIENTES (REQUIEREN LOGIN Y ROL PACIENTE) ==========
  {
    path: 'citas',
    component: Calendario,
    canActivate: [AuthGuard, PacienteGuard]
  },
  
  // ========== RUTAS DE MÉDICOS (REQUIEREN LOGIN Y ROL MÉDICO) ==========
  {
    path: 'dashboard-medico',
    loadComponent: () => import('./pages/dashboard-medico/dashboard-medico').then(m => m.DashboardMedicoComponent),
    canActivate: [AuthGuard, MedicoGuard]
  },
  {
    path: 'citas-medico',
    component: CitasMedico,
    canActivate: [AuthGuard, MedicoGuard]
  },
  {
    path: 'historial-clinico/:idPaciente',
    loadComponent: () => import('./pages/historial-clinico/historial-clinico').then(m => m.HistorialClinico),
    canActivate: [AuthGuard, MedicoGuard]
  },
  
  // Ruta por defecto redirige a home en lugar de login
  { path: '**', redirectTo: '/home' }
];