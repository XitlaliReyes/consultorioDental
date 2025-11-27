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
  procesandoCita: number | null = null;
  
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
    // 1. Verificación de seguridad
    if (!fecha || fecha.length < 10) {
      return 'Fecha Desconocida';
    }

    // 2. 🔥 SOLUCIÓN FINAL: ANÁLISIS MANUAL
    // Separamos la cadena (ej. '2025-12-20') en partes.
    const partes = fecha.split('-');
    
    // Convertimos las partes a números enteros.
    // Restamos 1 al mes porque en JavaScript los meses van de 0 (Enero) a 11 (Diciembre).
    const año = parseInt(partes[0], 10);
    const mesIndex = parseInt(partes[1], 10) - 1; 
    const dia = parseInt(partes[2], 10);
    
    // Creamos el objeto Date con las partes (forzando la interpretación como hora local).
    const date = new Date(año, mesIndex, dia); 
    
    // 3. Comprobación de que la fecha es válida (para atrapar errores de parseo)
    if (isNaN(date.getTime())) {
      console.error('La cadena de fecha falló el análisis manual:', fecha);
      return 'Fecha Inválida'; 
    }

    const opciones: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    
    return date.toLocaleDateString('es-ES', opciones);
  }

  formatearHora(hora: string): string {
    return hora.substring(0, 5);
  }
  
  aceptarCita(idCita: number) {
    if (confirm('¿Estás seguro de que deseas confirmar esta cita?')) {
        this.procesandoCita = idCita; // Activa el "Procesando..." en el botón
        
        // ** CAMBIO AQUÍ **: Usar el nuevo método del servicio
        this.api.confirmarCita(idCita).subscribe({
            next: () => {
                alert('¡Cita confirmada exitosamente! Se ha enviado el correo al paciente.');
                this.procesandoCita = null;
                // Recarga la lista para que el estado se actualice y el botón desaparezca
                this.cargarMisCitas(); 
            },
            error: (error) => {
                console.error('Error al confirmar la cita:', error);
                // Aquí podrías mostrar el mensaje de error que viene del backend
                alert(`Error al confirmar la cita: ${error.error?.error || 'Error de conexión'}`);
                this.procesandoCita = null;
            }
        });
    }
}

  logout() {
    this.auth.logout({
      logoutParams: {
        returnTo: window.location.origin + '/login'
      }
    });
  }
}