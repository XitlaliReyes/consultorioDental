import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface DiaCalendario {
  numero: number;
  fecha: Date;
  esDelMesActual: boolean;
  esHoy: boolean;
  estaSeleccionado: boolean;
  estaDisponible: boolean;
}

@Component({
  selector: 'app-calendario',
  standalone: true,
  imports: [FormsModule, DatePipe, CommonModule],
  templateUrl: './calendario.html',
  styleUrls: ['./calendario.css']
})
export class Calendario implements OnInit {
  // Propiedades existentes adaptadas
  selectedDate: Date | null = null;
  selectedHour: string | null = null;
  
  // Nuevas propiedades para el calendario personalizado
  currentMonth: Date = new Date();
  diasCalendario: DiaCalendario[] = [];
  diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  
  horasDisponibles: string[] = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30'
  ];

  // Simular horas no disponibles (ejemplo)
  horasOcupadas: string[] = ['10:00', '14:30', '16:00'];

  ngOnInit() {
    this.generarCalendario();
  }

  // Métodos existentes adaptados
  seleccionarHora(hora: string): void {
    if (this.isHoraDisponible(hora)) {
      this.selectedHour = hora;
    }
  }

  isHoraDisponible(hora: string): boolean {
    return !this.horasOcupadas.includes(hora);
  }

  cargarHorasDisponibles(): void {
    // Simular carga de horas disponibles basada en la fecha
    console.log('Cargando horas para:', this.selectedDate);
  }

  confirmarCita(): void {
    if (this.selectedDate && this.selectedHour) {
      console.log('Cita confirmada:', {
        fecha: this.selectedDate,
        hora: this.selectedHour
      });
      
      // Aquí enviarías los datos a tu backend
      // this.citasService.crearCita(this.selectedDate, this.selectedHour)
    }
  }

  // Nuevos métodos para el calendario personalizado
  generarCalendario() {
    const año = this.currentMonth.getFullYear();
    const mes = this.currentMonth.getMonth();
    const hoy = new Date();
    
    // Primer día del mes
    const primerDia = new Date(año, mes, 1);
    const ultimoDia = new Date(año, mes + 1, 0);
    
    // Días para mostrar (incluyendo días del mes anterior y siguiente)
    const inicioCalendario = new Date(primerDia);
    inicioCalendario.setDate(primerDia.getDate() - primerDia.getDay());
    
    const finCalendario = new Date(ultimoDia);
    const diasRestantes = 6 - ultimoDia.getDay();
    finCalendario.setDate(ultimoDia.getDate() + diasRestantes);

    this.diasCalendario = [];
    const fechaActual = new Date(inicioCalendario);

    while (fechaActual <= finCalendario) {
      const dia: DiaCalendario = {
        numero: fechaActual.getDate(),
        fecha: new Date(fechaActual),
        esDelMesActual: fechaActual.getMonth() === mes,
        esHoy: this.esMismaFecha(fechaActual, hoy),
        estaSeleccionado: this.selectedDate ? this.esMismaFecha(fechaActual, this.selectedDate) : false,
        estaDisponible: this.isDiaDisponible(fechaActual)
      };
      
      this.diasCalendario.push(dia);
      fechaActual.setDate(fechaActual.getDate() + 1);
    }
  }

  esMismaFecha(fecha1: Date, fecha2: Date): boolean {
    return fecha1.getDate() === fecha2.getDate() &&
           fecha1.getMonth() === fecha2.getMonth() &&
           fecha1.getFullYear() === fecha2.getFullYear();
  }

  isDiaDisponible(fecha: Date): boolean {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const fechaComparar = new Date(fecha);
    fechaComparar.setHours(0, 0, 0, 0);
    
    // No permitir fechas pasadas
    if (fechaComparar < hoy) return false;
    
    // No permitir domingos (día 0)
    if (fecha.getDay() === 0) return false;
    
    return true;
  }

  seleccionarDia(dia: DiaCalendario) {
    if (!dia.esDelMesActual || !dia.estaDisponible) return;
    
    this.selectedDate = dia.fecha;
    this.selectedHour = null; // Reset hora seleccionada
    this.generarCalendario(); // Regenerar para actualizar selección
    this.cargarHorasDisponibles(); // Cargar horas para la nueva fecha
  }

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
    return prevMonth.getMonth() >= currentMonth.getMonth() || 
           prevMonth.getFullYear() > currentMonth.getFullYear();
  }

  canNavigateToNext(): boolean {
    const nextMonth = new Date(this.currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const limitMonth = new Date();
    limitMonth.setMonth(limitMonth.getMonth() + 6); // Límite de 6 meses
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
    
    const day = this.selectedDate.getDate().toString().padStart(2, '0');
    const month = (this.selectedDate.getMonth() + 1).toString().padStart(2, '0');
    const year = this.selectedDate.getFullYear();
    
    return `${day}/${month}/${year}`;
  }
}