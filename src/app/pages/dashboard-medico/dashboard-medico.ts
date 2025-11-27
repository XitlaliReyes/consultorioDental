import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
// IMPORTAR LAS NUEVAS INTERFACES
import { Api, CitaMedico, PacienteBasico, PacienteDetalle } from '../../services/api'; 
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
  
  // MODIFICAR TIPO DE VISTA ACTUAL
  vistaActual: 'dashboard' | 'citas' | 'pacientes' | 'paciente-detalle' = 'dashboard';
  
  misCitas: CitaMedico[] = [];
  isLoadingCitas = false;
  totalCitasPendientes = 0;
  citasHoy = 0;
  citasEstaSemana = 0;
  
  // NUEVAS PROPIEDADES PARA PACIENTES
  misPacientes: PacienteBasico[] = [];
  isLoadingPacientes = false;

  pacienteSeleccionado: PacienteDetalle | null = null;
  isLoadingDetalle = false;


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
  
  // NUEVO MÉTODO: Cargar lista de pacientes
  cargarMisPacientes() {
    this.isLoadingPacientes = true;
    this.api.getMisPacientes().subscribe({
      next: (pacientes) => {
        this.misPacientes = pacientes;
        this.isLoadingPacientes = false;
      },
      error: (error) => {
        console.error('Error al cargar pacientes del médico:', error);
        this.isLoadingPacientes = false;
      }
    });
  }

  // NUEVO MÉTODO: Ver detalle del paciente
  verDetallePaciente(idPaciente: number) {
    this.pacienteSeleccionado = null; // Limpiar vista anterior
    this.vistaActual = 'paciente-detalle';
    this.isLoadingDetalle = true;

    this.api.getPacienteDetalle(idPaciente).subscribe({
      next: (paciente) => {
        this.pacienteSeleccionado = paciente;
        this.isLoadingDetalle = false;
      },
      error: (error) => {
        console.error('Error al cargar detalle del paciente:', error);
        this.isLoadingDetalle = false;
        // Opcional: Volver a la lista si falla
        alert('Error al cargar los detalles del paciente. Por favor, intente de nuevo.');
        this.navegarA('pacientes'); 
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

  // MODIFICAR MÉTODO navegarA
  navegarA(vista: 'dashboard' | 'citas' | 'pacientes' | 'paciente-detalle') {
    this.vistaActual = vista;
    this.pacienteSeleccionado = null; // Limpiar detalle al cambiar de vista principal
    
    if (vista === 'citas') {
      this.cargarCitasPendientes();
    }
    
    if (vista === 'pacientes') {
      this.cargarMisPacientes(); // Cargar la lista al entrar a la vista
    }
  }

  formatearFecha(fecha: string): string {
    const date = new Date(fecha + 'T00:00:00'); // Añadir T00:00:00 para evitar problemas de zona horaria
    const opciones: Intl.DateTimeFormatOptions = {
      year: 'numeric', // Añadir año para la fecha de nacimiento
      month: 'long',
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