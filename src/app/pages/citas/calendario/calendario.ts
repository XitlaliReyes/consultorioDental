import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
// ¡NUEVA IMPORTACIÓN! Necesaria para la vista 'mis-citas'
import { MisCitasComponent } from '../mis-citas/mis-citas'; 
import { AuthService } from '@auth0/auth0-angular';
import { catchError, of, switchMap } from 'rxjs';

// Interfaces (Se mantienen igual)
interface Servicio {
  ID_Servicio: number;
  Nombre: string;
  Descripcion: string;
  Duracion: number;
  Costo: number;
}

interface DiaCalendario {
  numero: number;
  fecha: Date;
  esDelMesActual: boolean;
  esHoy: boolean;
  estaSeleccionado: boolean;
  estaDisponible: boolean;
}

interface CitaResponse {
  message: string;
  id_cita: number;
  id_medico_asignado: number;
}

@Component({
  selector: 'app-calendario',
  standalone: true,
  // ¡IMPORTANTE! Agregar MisCitasComponent y HttpClientModule
  imports: [FormsModule, DatePipe, CommonModule, HttpClientModule, MisCitasComponent], 
  templateUrl: './calendario.html',
  styleUrls: ['./calendario.css']
})
export class Calendario implements OnInit {

  private apiUrl = 'http://localhost:3000';

  // ** NUEVA PROPIEDAD: Controla la vista principal (selección, agendar, mis-citas) **
  currentView: 'selection' | 'agendar' | 'mis-citas' = 'selection';

  // Propiedades de Agendamiento (Se mantienen igual)
  selectedDate: Date | null = null;
  selectedHour: string | null = null;
  pasoActual: number = 1;
  servicios: Servicio[] = [];
  idServicioSeleccionado: number | null = null;
  nombreServicioSeleccionado: string = '';
  horasOcupadas: string[] = [];
  notasCita: string = '';

  // Propiedades de Calendario (Se mantienen igual)
  currentMonth: Date = new Date();
  diasCalendario: DiaCalendario[] = [];
  diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  horasDisponibles: string[] = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00'
  ];

  constructor(private http: HttpClient,
    private auth: AuthService
  ) { }

  ngOnInit(): void {
    // Solo cargamos servicios si estamos en la vista 'agendar' o en el paso 1
    if (this.currentView === 'agendar' || this.pasoActual === 1) { 
        this.cargarServicios(); 
    }
    this.generarCalendario();
  }
  
  // ===================================
  // ** LÓGICA DE NAVEGACIÓN DE VISTAS (NUEVA) **
  // ===================================

  selectView(view: 'agendar' | 'mis-citas'): void {
    this.currentView = view;
    // Si vamos a Agendar, aseguramos cargar los servicios y reiniciar el flujo
    if (view === 'agendar') {
      this.cargarServicios();
      this.resetearFlujo(); // Esto asegura que 'pasoActual' sea 1
    }
  }

  volverASeleccion(): void {
    this.currentView = 'selection';
    this.resetearFlujo(); // Opcional, pero buena práctica
  }

  // ===================================
  // LÓGICA DE CALENDARIO Y NAVEGACIÓN (Se mantiene igual)
  // ===================================
  // ... (previousMonth, nextMonth, canNavigateToPrevious, canNavigateToNext, getCurrentMonthYear, getFormattedSelectedDate, generarCalendario, se mantienen igual) ...

  previousMonth() {
    if (!this.canNavigateToPrevious()) return;
    this.currentMonth.setMonth(this.currentMonth.getMonth() - 1);
    this.generarCalendario();
  }

  nextMonth() {
    if (!this.canNavigateToNext()) return;
    this.currentMonth.setMonth(this.currentMonth.getMonth() + 1);
    this.generarCalendario();
  }

  canNavigateToPrevious(): boolean {
    const prevMonth = new Date(this.currentMonth);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);
    return prevMonth >= currentMonth;
  }

  canNavigateToNext(): boolean {
    const nextMonth = new Date(this.currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const limitMonth = new Date();
    limitMonth.setMonth(limitMonth.getMonth() + 6);
    return nextMonth <= limitMonth;
  }

  getCurrentMonthYear(): string {
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return `${meses[this.currentMonth.getMonth()]} ${this.currentMonth.getFullYear()}`;
  }

  getFormattedSelectedDate(): string {
    if (!this.selectedDate) return '';
    const date = this.selectedDate;
    const options: Intl.DateTimeFormatOptions = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    return date.toLocaleDateString('es-ES', options);
  }

  generarCalendario(): void {
    this.diasCalendario = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstDayOfMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth(), 1);
    const lastDayOfMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 0);

    const startDayOfWeek = firstDayOfMonth.getDay();
    for (let i = 0; i < startDayOfWeek; i++) {
      const prevDate = new Date(firstDayOfMonth);
      prevDate.setDate(firstDayOfMonth.getDate() - (startDayOfWeek - i));
      this.diasCalendario.push({
        numero: prevDate.getDate(),
        fecha: prevDate,
        esDelMesActual: false,
        esHoy: false,
        estaSeleccionado: false,
        estaDisponible: false,
      });
    }

    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      const currentDate = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth(), i);
      currentDate.setHours(0, 0, 0, 0);

      const isToday = currentDate.getTime() === today.getTime();
      const isAvailable = currentDate >= today && currentDate.getDay() !== 0;

      this.diasCalendario.push({
        numero: i,
        fecha: currentDate,
        esDelMesActual: true,
        esHoy: isToday,
        estaSeleccionado: false,
        estaDisponible: isAvailable,
      });
    }

    const totalDays = this.diasCalendario.length;
    const requiredTotal = 42;

    for (let i = 1; this.diasCalendario.length < requiredTotal; i++) {
      const nextDate = new Date(lastDayOfMonth);
      nextDate.setDate(lastDayOfMonth.getDate() + i);
      this.diasCalendario.push({
        numero: nextDate.getDate(),
        fecha: nextDate,
        esDelMesActual: false,
        esHoy: false,
        estaSeleccionado: false,
        estaDisponible: false,
      });
    }
  }

  // ===================================
  // LÓGICA DE AGENDAMIENTO Y CONEXIÓN API (Se mantiene igual)
  // ===================================

  seleccionarServicio(servicio: Servicio): void {
      this.idServicioSeleccionado = servicio.ID_Servicio;
      this.nombreServicioSeleccionado = servicio.Nombre;
      this.pasoActual = 2;
  }

  cargarServicios(): void {
      this.http.get<Servicio[]>(`${this.apiUrl}/api/servicios`).subscribe({
          next: (data) => {
              this.servicios = data;
          },
          error: (err) => {
              console.error('Error al cargar servicios:', err);
          }
      });
  }

  getHorasOcupadas(idServicio: number, fecha: Date): void {
      const fechaFormateada = fecha.toISOString().split('T')[0];

      this.http.get<{ horas_ocupadas: { hora: string }[] }>(
          `${this.apiUrl}/api/citas/disponibilidad/${idServicio}/${fechaFormateada}`
      ).subscribe({
          next: (res) => {
              this.horasOcupadas = res.horas_ocupadas.map(c => c.hora);
          },
          error: (err) => {
              console.error('Error al cargar disponibilidad:', err);
              this.horasOcupadas = [];
          }
      });
  }

  seleccionarDia(dia: DiaCalendario): void {
    if (this.pasoActual !== 2) return;
    if (!dia.esDelMesActual || !dia.estaDisponible) return;

    this.diasCalendario.forEach((d: DiaCalendario) => d.estaSeleccionado = false);
    dia.estaSeleccionado = true;
    this.selectedDate = dia.fecha;
    this.selectedHour = null;

    if (this.selectedDate && this.idServicioSeleccionado) {
        this.getHorasOcupadas(this.idServicioSeleccionado, this.selectedDate);
    }
  }

  seleccionarHora(hora: string): void {
    this.selectedHour = hora;
  }

  isHoraDisponible(hora: string): boolean {
    return !this.horasOcupadas.includes(hora);
  }

  // Reemplazar el método confirmarCita():
confirmarCita(): void {
  if (!this.selectedDate || !this.selectedHour || !this.idServicioSeleccionado) {
    console.error('Faltan datos para confirmar la cita.');
    return;
  }

  const datosCita = {
    fecha: this.selectedDate.toISOString().split('T')[0],
    hora: this.selectedHour + ':00',
    id_servicio: this.idServicioSeleccionado,
    notas: this.notasCita
  };

  // Obtener el token y hacer la petición autenticada
  this.auth.getAccessTokenSilently().pipe(
    switchMap((token: any) => {
      const headers = { Authorization: `Bearer ${token}` };
      return this.http.post<CitaResponse>(`${this.apiUrl}/api/citas/agendar`, datosCita, { headers });
    }),
    catchError((err: { error: { error: any; }; }) => {
      console.error('Error al agendar:', err);
      alert('Error: ' + (err.error?.error || 'No se pudo agendar la cita.'));
      return of(null);
    })
  ).subscribe({
    next: (response) => {
      if (response) {
        alert(`Cita agendada exitosamente. ID: ${response.id_cita}. Se le ha asignado el Médico ID: ${response.id_medico_asignado}.`);
        this.resetearFlujo();
        this.currentView = 'selection';
      }
    }
  });
}

  resetearFlujo(): void {
      this.pasoActual = 1;
      this.selectedDate = null;
      this.selectedHour = null;
      this.idServicioSeleccionado = null;
      this.nombreServicioSeleccionado = '';
      this.notasCita = '';
      this.horasOcupadas = [];
      this.generarCalendario();
  }
}