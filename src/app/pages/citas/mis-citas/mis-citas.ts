import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router'; // Lo usaremos para un posible botón de "Agendar Nueva Cita"

interface Cita {
  ID_Cita: number;
  Fecha_Cita: string; 
  Hora_Cita: string;
  Estado: 'Pendiente' | 'Confirmada' | 'Cancelada';
  Servicio: string;
  Nombre_Medico: string;
  Apellidos_Medico: string;
}

@Component({
  selector: 'app-mis-citas',
  standalone: true,
  imports: [CommonModule, HttpClientModule, DatePipe],
  templateUrl: './mis-citas.html',
  styleUrls: ['./mis-citas.css']
})
export class MisCitasComponent implements OnInit {
  
  private apiUrl = 'http://localhost:3000';
  citas: Cita[] = [];
  loading = true;
  error: string | null = null;
  
  // Emitirá un evento al padre para volver a la selección
  constructor(private http: HttpClient) { } 

  ngOnInit(): void {
    this.cargarCitas();
  }

  cargarCitas(): void {
    this.loading = true;
    this.error = null;
    this.http.get<Cita[]>(`${this.apiUrl}/api/citas/mis-citas`).subscribe({
      next: (data) => {
        this.citas = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar citas:', err);
        this.error = 'No se pudieron cargar las citas. Asegúrate de estar logueado y tener un perfil de Paciente.';
        this.loading = false;
      }
    });
  }
  
  // Función para determinar si la cita se puede cancelar (más de 7 días de antelación)
  canCancel(cita: Cita): boolean {
      if (cita.Estado === 'Cancelada') return false;

      // Usamos solo Fecha_Cita, no Hora_Cita, para evitar problemas de zona horaria 
      // y basar la restricción en el día de la cita.
      const fechaCita = new Date(cita.Fecha_Cita);
      fechaCita.setHours(0, 0, 0, 0); // Limpiar la hora
      
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0); // Limpiar la hora
      
      const diffTime = fechaCita.getTime() - hoy.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

      // Se puede cancelar si faltan más de 7 días (es decir, 8 o más)
      return diffDays > 7; 
  }

  cancelarCita(idCita: number): void {
    if (!confirm('¿Estás seguro de que deseas cancelar esta cita? Esta acción no se puede deshacer.')) {
      return;
    }

    this.http.post(`${this.apiUrl}/api/citas/cancelar/${idCita}`, {}).subscribe({
      next: (response: any) => {
        alert(response.message);
        this.cargarCitas(); // Recargar la lista para ver el cambio de estado
      },
      error: (err) => {
        console.error('Error al cancelar:', err);
        alert('Error al cancelar la cita: ' + (err.error?.error || 'No se pudo cancelar.'));
      }
    });
  }
}