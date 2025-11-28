import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AuthService } from '@auth0/auth0-angular';
import { switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

interface Cita {
  ID_Cita: number;
  Fecha_Cita: string; 
  Hora_Cita: string;
  Estado: 'Agendada' | 'Confirmada' | 'Cancelada';
  Servicio: string;
  Nombre_Medico: string;
  Apellidos_Medico: string;
  Notas?: string;
}

@Component({
  selector: 'app-mis-citas',
  standalone: true,
  imports: [CommonModule, HttpClientModule, DatePipe],
  templateUrl: './mis-citas.html',
  styleUrls: ['./mis-citas.css']
})
export class MisCitasComponent implements OnInit {
  
  private apiUrl = 'https://consultorio-backend-production-9816.up.railway.app';
  citas: Cita[] = [];
  loading = true;
  error: string | null = null;
  
  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) { } 

  ngOnInit(): void {
    this.cargarCitas();
  }

  cargarCitas(): void {
    this.loading = true;
    this.error = null;
    
    // Obtener el token de Auth0 y hacer la petición autenticada
    this.auth.getAccessTokenSilently().pipe(
      switchMap(token => {
        const headers = { Authorization: `Bearer ${token}` };
        return this.http.get<Cita[]>(`${this.apiUrl}/api/citas/mis-citas`, { headers });
      }),
      catchError(err => {
        console.error('Error al cargar citas:', err);
        this.error = 'No se pudieron cargar las citas. Asegúrate de estar logueado y tener un perfil de Paciente.';
        this.loading = false;
        return of([]);
      })
    ).subscribe({
      next: (data) => {
        this.citas = data.sort((a, b) => {
          if (a.Estado === 'Cancelada' && b.Estado !== 'Cancelada') return 1;
          if (a.Estado !== 'Cancelada' && b.Estado === 'Cancelada') return -1;

          const fa = this.parseFechaHora(a.Fecha_Cita, a.Hora_Cita).getTime();
          const fb = this.parseFechaHora(b.Fecha_Cita, b.Hora_Cita).getTime();
          return fa - fb;
        });

        this.loading = false;
      }
    });
  }
  

private parseFechaHora(fecha: string, hora: string = ''): Date {
  if (!fecha) return new Date(NaN);

  hora = hora.replace(/hrs?/i, '').trim();
  const h = hora.match(/(\d{1,2}):(\d{2})(\s*[ap]m)?/i);
  const hh = h ? (h[3]?.toLowerCase().includes('p') && +h[1] < 12 ? +h[1] + 12 :
                  h[3]?.toLowerCase().includes('a') && +h[1] === 12 ? 0 : +h[1]) : 0;
  const mm = h ? +h[2] : 0;

  // ISO → YYYY-MM-DD
  let m = fecha.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return new Date(+m[1], +m[2] - 1, +m[3], hh, mm);

  // DD/MM/YYYY
  m = fecha.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (m) return new Date(+m[3], +m[2] - 1, +m[1], hh, mm);

  // Nombre de mes (en o es)
  const meses: Record<string, number> = {
    january:0,february:1,march:2,april:3,may:4,june:5,july:6,august:7,september:8,october:9,november:10,december:11,
    enero:0,febrero:1,marzo:2,abril:3,mayo:4,junio:5,julio:6,agosto:7,septiembre:8,octubre:9,noviembre:10,diciembre:11
  };
  fecha = fecha.replace(/^[A-Za-z]+,\s*/, '').trim();
  m = fecha.match(/([A-Za-záéíóúñ]+)\s+(\d{1,2}),?\s+(\d{4})/i);
  if (m && meses[m[1].toLowerCase()] != null)
    return new Date(+m[3], meses[m[1].toLowerCase()], +m[2], hh, mm);

  const parsed = Date.parse(`${fecha} ${hora}`);
  return isNaN(parsed) ? new Date(NaN) : new Date(parsed);
}

  // Función para determinar si la cita se puede cancelar (más de 7 días de antelación)
  canCancel(cita: Cita): boolean {
    if (cita.Estado === 'Cancelada') return false;

    const fechaCita = new Date(cita.Fecha_Cita);
    fechaCita.setHours(0, 0, 0, 0);
    
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const diffTime = fechaCita.getTime() - hoy.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

    // Se puede cancelar si faltan más de 7 días
    return diffDays > 7; 
  }

  cancelarCita(idCita: number): void {
    if (!confirm('¿Estás seguro de que deseas cancelar esta cita? Esta acción no se puede deshacer.')) {
      return;
    }

    // Obtener el token y hacer la petición autenticada
    this.auth.getAccessTokenSilently().pipe(
      switchMap(token => {
        const headers = { Authorization: `Bearer ${token}` };
        return this.http.post(`${this.apiUrl}/api/citas/cancelar/${idCita}`, {}, { headers });
      }),
      catchError(err => {
        console.error('Error al cancelar:', err);
        alert('Error al cancelar la cita: ' + (err.error?.error || 'No se pudo cancelar.'));
        return of(null);
      })
    ).subscribe({
      next: (response: any) => {
        if (response) {
          alert(response.message);
          this.cargarCitas(); // Recargar la lista
        }
      }
    });
  }
}