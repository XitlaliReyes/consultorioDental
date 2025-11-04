
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Api, ServicioConCitas } from '../../../services/api';

@Component({
  selector: 'app-citas-medico',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './citas-medico.html',
  styleUrls: ['./citas-medico.css']
})
export class CitasMedico implements OnInit {
  private api = inject(Api);

  serviciosConCitas: ServicioConCitas[] = [];
  isLoading = true;
  procesandoCita: number | null = null;

  ngOnInit() {
    this.cargarCitasPendientes();
  }

  cargarCitasPendientes() {
    this.isLoading = true;
    this.api.getCitasPendientes().subscribe({
      next: (servicios) => {
        this.serviciosConCitas = servicios;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar citas pendientes:', error);
        this.isLoading = false;
      }
    });
  }

  aceptarCita(idCita: number) {
    if (confirm('¿Estás seguro de que deseas aceptar esta cita?')) {
      this.procesandoCita = idCita;
      this.api.aceptarCita(idCita).subscribe({
        next: () => {
          alert('¡Cita aceptada exitosamente!');
          this.procesandoCita = null;
          this.cargarCitasPendientes();
        },
        error: (error) => {
          console.error('Error al aceptar la cita:', error);
          alert('Error al aceptar la cita. Por favor intenta nuevamente.');
          this.procesandoCita = null;
        }
      });
    }
  }

  formatearFecha(fecha: string): string {
    const date = new Date(fecha);
    const opciones: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('es-ES', opciones);
  }

  formatearHora(hora: string): string {
    return hora.substring(0, 5); // Obtener solo HH:mm
  }
}

