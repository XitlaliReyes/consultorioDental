import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { Api, CitaMedico } from '../../services/api';
import { Router } from '@angular/router';
import { CitasMedico } from '../citas/citas-medico/citas-medico';

@Component({
  selector: 'app-dashboard-medico',
  standalone: true,
  imports: [CommonModule, CitasMedico],
  templateUrl: './dashboard-medico.html',
  styleUrls: ['./dashboard-medico.css']
})
export class DashboardMedicoComponent implements OnInit {
  private auth = inject(AuthService);
  private api = inject(Api);
  private router = inject(Router);
  
  medicoNombre: string = '';
  medicoApellidos: string = '';
  medicoCorreo: string = '';
  
  vistaActual: 'dashboard' | 'citas' = 'dashboard';
  misCitas: CitaMedico[] = [];
  isLoadingCitas = false;
  totalCitasPendientes = 0;
  citasHoy = 0;
  citasEstaSemana = 0;

  ngOnInit() {
    this.api.getRole().subscribe({
      next: (response) => {
        if (response && response.role === 'Medico') {
          this.medicoNombre = response.nombre || '';
          this.medicoApellidos = response.apellidos || '';
          this.medicoCorreo = response.correo || '';
          this.cargarMisCitas();
          this.cargarCitasPendientes();
        }
      },
      error: (error) => {
        console.error('Error al obtener datos del médico:', error);
      }
    });
  }

  cargarMisCitas() {
    this.isLoadingCitas = true;
    this.api.getMisCitasMedico().subscribe({
      next: (citas) => {
        this.misCitas = citas;
        this.calcularEstadisticas();
        this.isLoadingCitas = false;
      },
      error: (error) => {
        console.error('Error al cargar citas del médico:', error);
        this.isLoadingCitas = false;
      }
    });
  }

  cargarCitasPendientes() {
    this.api.getCitasPendientes().subscribe({
      next: (servicios) => {
        this.totalCitasPendientes = servicios.reduce(
          (total, servicio) => total + servicio.citas.length,
          0
        );
      },
      error: (error) => {
        console.error('Error al cargar citas pendientes:', error);
      }
    });
  }

  calcularEstadisticas() {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const inicioSemana = new Date(hoy);
    inicioSemana.setDate(hoy.getDate() - hoy.getDay());

    const finSemana = new Date(inicioSemana);
    finSemana.setDate(inicioSemana.getDate() + 7);

    this.citasHoy = this.misCitas.filter((cita) => {
      const fechaCita = new Date(cita.Fecha);
      fechaCita.setHours(0, 0, 0, 0);
      return fechaCita.getTime() === hoy.getTime();
    }).length;

    this.citasEstaSemana = this.misCitas.filter((cita) => {
      const fechaCita = new Date(cita.Fecha);
      return fechaCita >= inicioSemana && fechaCita < finSemana;
    }).length;
  }

  navegarA(vista: 'dashboard' | 'citas') {
    this.vistaActual = vista;
    if (vista === 'citas') {
      this.cargarCitasPendientes();
    }
  }

  formatearFecha(fecha: string): string {
    const date = new Date(fecha);
    const opciones: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric'
    };
    return date.toLocaleDateString('es-ES', opciones);
  }

  formatearHora(hora: string): string {
    return hora.substring(0, 5);
  }

  logout() {
    this.auth.logout({
      logoutParams: {
        returnTo: window.location.origin + '/login'
      }
    });
  }
}
