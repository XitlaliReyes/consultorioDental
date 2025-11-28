import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { 
  Api, 
  PacienteDetalle, 
  AntecedenteTipo, 
  PacienteAntecedente,
  AntecedentesOdontologicos,
  Evolucion 
} from '../../services/api';

@Component({
  selector: 'app-historial-clinico',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './historial-clinico.html',
  styleUrls: ['./historial-clinico.css']
})
export class HistorialClinico implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(Api);
  private router = inject(Router);

  medicoNombre: string = '';
  medicoApellidos: string = '';
  medicoCorreo: string = '';

  paciente: PacienteDetalle | null = null;
  pacienteId: number = 0;

  cargando = true;
  error = '';

  // Secciones del historial
  seccionActiva: 'datos' | 'antecedentes' | 'odonto' | 'evolucion' = 'datos';

  // Antecedentes Personales
  tiposAntecedente: AntecedenteTipo[] = [];
  antecedentesSeleccionados: { [key: number]: boolean } = {};
  guardandoAntecedentes = false;

  // Antecedentes Odontológicos
  antecedentesOdonto: AntecedentesOdontologicos = {
    ID_Paciente: 0,
    Ultima_Visita: '',
    Motivo_Consulta: '',
    Experiencia: '',
    Molestias_Boca: 0,
    Sangrado_Encias: 0,
    Movilidad_Dental: 0,
    Rechina_Dientes: 0,
    Cepillado_Dia: 0
  };
  guardandoOdonto = false;

  // Evolución
  evoluciones: Evolucion[] = [];
  nuevaEvolucion: Partial<Evolucion> = {
    Fecha: new Date().toISOString().split('T')[0],
    OD: '',
    Tratamiento: '',
    Costo: 0
  };
  mostrarFormEvolucion = false;
  guardandoEvolucion = false;

  ngOnInit() {
    this.cargarDatosMedico();
    this.cargarHistorialPaciente();
  }

  private cargarDatosMedico() {
    this.api.getRole().subscribe({
      next: (response) => {
        if (response && response.role === 'Medico') {
          this.medicoNombre = response.nombre || '';
          this.medicoApellidos = response.apellidos || '';
          this.medicoCorreo = response.correo || '';
        }
      },
      error: (err) => {
        console.error('Error al cargar datos del médico:', err);
      }
    });
  }

  private cargarHistorialPaciente() {
    const param = this.route.snapshot.paramMap.get('idPaciente');
    this.pacienteId = param ? Number(param) : 0;

    if (this.pacienteId <= 0) {
      this.error = 'ID de paciente inválido';
      this.cargando = false;
      return;
    }

    this.obtenerHistorial();
  }

  private obtenerHistorial() {
    this.cargando = true;
    this.error = '';

    this.api.getPacienteDetalle(this.pacienteId).subscribe({
      next: (data) => {
        this.paciente = data;
        this.cargando = false;
        
        // Cargar datos adicionales
        this.cargarTiposAntecedente();
        this.cargarAntecedentesPersonales();
        this.cargarAntecedentesOdonto();
        this.cargarEvoluciones();
      },
      error: (err) => {
        console.error('Error al cargar historial:', err);
        
        if (err.status === 403) {
          this.error = 'Acceso denegado: Este paciente no está asignado a usted.';
          setTimeout(() => this.router.navigate(['/dashboard-medico']), 3000);
        } else if (err.status === 404) {
          this.error = 'Paciente no encontrado.';
        } else {
          this.error = 'No se pudo cargar el historial clínico del paciente.';
        }
        
        this.cargando = false;
      }
    });
  }

  // ===================================
  // ANTECEDENTES PERSONALES
  // ===================================

  private cargarTiposAntecedente() {
    this.api.getTiposAntecedente().subscribe({
      next: (tipos) => {
        this.tiposAntecedente = tipos;
      },
      error: (err) => {
        console.error('Error al cargar tipos de antecedente:', err);
      }
    });
  }

  private cargarAntecedentesPersonales() {
    this.api.getAntecedentesMedicos(this.pacienteId).subscribe({
      next: (antecedentes) => {
        // Convertir array a objeto para fácil acceso
        antecedentes.forEach(a => {
          this.antecedentesSeleccionados[a.ID_Tipo] = !!a.Valor;
        });
      },
      error: (err) => {
        console.error('Error al cargar antecedentes personales:', err);
      }
    });
  }

  guardarAntecedentesPersonales() {
    this.guardandoAntecedentes = true;

    const payload = this.tiposAntecedente.map(tipo => ({
      ID_Tipo: tipo.ID_Tipo,
      Valor: this.antecedentesSeleccionados[tipo.ID_Tipo] ? 1 : 0
    }));

    this.api.updateAntecedentesMedicos(this.pacienteId, payload).subscribe({
      next: () => {
        alert('Antecedentes personales guardados exitosamente');
        this.guardandoAntecedentes = false;
      },
      error: (err) => {
        console.error('Error al guardar antecedentes:', err);
        alert('Error al guardar antecedentes personales');
        this.guardandoAntecedentes = false;
      }
    });
  }

  // ===================================
  // ANTECEDENTES ODONTOLÓGICOS
  // ===================================

  private cargarAntecedentesOdonto() {
    this.api.getAntecedentesOdonto(this.pacienteId).subscribe({
      next: (data) => {
        if (data) {
          this.antecedentesOdonto = data;
        } else {
          this.antecedentesOdonto.ID_Paciente = this.pacienteId;
        }
      },
      error: (err) => {
        console.error('Error al cargar antecedentes odontológicos:', err);
      }
    });
  }

  guardarAntecedentesOdonto() {
    this.guardandoOdonto = true;

    this.api.updateAntecedentesOdonto(this.pacienteId, this.antecedentesOdonto).subscribe({
      next: () => {
        alert('Antecedentes odontológicos guardados exitosamente');
        this.guardandoOdonto = false;
      },
      error: (err) => {
        console.error('Error al guardar antecedentes odontológicos:', err);
        alert('Error al guardar antecedentes odontológicos');
        this.guardandoOdonto = false;
      }
    });
  }

  // ===================================
  // EVOLUCIÓN
  // ===================================

  private cargarEvoluciones() {
    this.api.getEvolucion(this.pacienteId).subscribe({
      next: (evoluciones) => {
        this.evoluciones = evoluciones;
      },
      error: (err) => {
        console.error('Error al cargar evoluciones:', err);
      }
    });
  }

  agregarEvolucion() {
    if (!this.nuevaEvolucion.OD || !this.nuevaEvolucion.Tratamiento) {
      alert('Por favor complete los campos requeridos');
      return;
    }

    this.guardandoEvolucion = true;

    this.api.addEvolucion(this.pacienteId, this.nuevaEvolucion).subscribe({
      next: () => {
        alert('Evolución agregada exitosamente');
        this.cargarEvoluciones();
        this.mostrarFormEvolucion = false;
        this.nuevaEvolucion = {
          Fecha: new Date().toISOString().split('T')[0],
          OD: '',
          Tratamiento: '',
          Costo: 0
        };
        this.guardandoEvolucion = false;
      },
      error: (err) => {
        console.error('Error al agregar evolución:', err);
        alert('Error al agregar evolución');
        this.guardandoEvolucion = false;
      }
    });
  }

  // ===================================
  // NAVEGACIÓN
  // ===================================

  volverAlDashboard() {
    this.router.navigate(['/dashboard-medico']);
  }

  cambiarSeccion(seccion: 'datos' | 'antecedentes' | 'odonto' | 'evolucion') {
    this.seccionActiva = seccion;
  }

  calcularEdad(fechaNacimiento: string): number {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    
    return edad;
  }
}