import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { 
  Api, 
  PacienteDetalle, 
  AntecedenteTipo, 
  PacienteAntecedente, // Se usa para la estructura de los antecedentes guardados
  AntecedentesOdontologicos,
  Evolucion 
} from '../../services/api';
import { forkJoin } from 'rxjs'; // Necesario para la carga inicial

// NOTA: Se definen localmente solo para el Mapeo, aunque se importan desde 'api'
interface AntecedentePaciente {
  ID_Tipo: number;
  // FIX: Se actualiza el tipo a 'number | boolean' para resolver el error TS2345.
  // Esto permite que los datos que vienen del API (PacienteAntecedente, que puede tener boolean o number) 
  // sean asignados a esta interfaz.
  Valor: number | boolean; 
}

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

  // --- Mapeo CRÍTICO para las 9 preguntas nuevas ---
  // Estos IDs deben coincidir con los IDs generados en tu tabla `tipo_antecedente`
  // después del ID 16 (Anemia, Diabetes, etc.).
  private readonly ANTECEDENTE_MAP: { [key: string]: number } = {
    alergiaSustancia: 17, // ID de BD: ¿Alergia a alguna sustancia o medicamento?
    alergiaAnestesia: 18, // ID de BD: ¿Alergia a la anestesia dental?
    bajoTratamiento: 19,  // ID de BD: ¿Actualmente está bajo algún tratamiento?
    intervenidoQx: 20,    // ID de BD: ¿Ha sido intervenido quirúrgicamente?
    enfGraveNoMencionada: 21, // ID de BD: ¿Padece alguna enfermedad grave no mencionada?
    embarazada: 22,       // ID de BD: ¿Está embarazada?
    consumeAlcohol: 23,   // ID de BD: ¿Consume bebidas alcohólica?
    fuma: 24,             // ID de BD: ¿Fuma?
    consumeDrogas: 25,    // ID de BD: ¿Consume algún tipo de droga?
  };
  
  // Notificación (Reemplazo de alert())
  notificacion: { mensaje: string, tipo: 'success' | 'error' | null } = { mensaje: '', tipo: null };


  medicoNombre: string = '';
  medicoApellidos: string = '';
  medicoCorreo: string = '';

  paciente: PacienteDetalle | null = null;
  pacienteId: number = 0;

  cargando = true;
  error = '';

  // Secciones del historial
  seccionActiva: 'datos' | 'antecedentes' | 'odonto' | 'evolucion' = 'datos';

  // Antecedentes Personales (Checklist y Preguntas)
  tiposAntecedente: AntecedenteTipo[] = [];
  antecedentesSeleccionados: { [key: number]: boolean } = {};
  guardandoAntecedentes = false;
  
  // Modelo para las preguntas de Sí/No (Añadido para el checklist completo)
  otrasPreguntas = {
    alergiaSustancia: false,
    alergiaAnestesia: false,
    bajoTratamiento: false,
    intervenidoQx: false,
    enfGraveNoMencionada: false,
    embarazada: false, // Solo se mostrará si es mujer
    consumeAlcohol: false,
    fuma: false,
    consumeDrogas: false,
  };
  esPacienteMujer: boolean = false; // Variable para manejar la visibilidad de 'embarazada'

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
    Fecha: (() => {
      const hoy = new Date();
      const yyyy = hoy.getFullYear();
      const mm = String(hoy.getMonth() + 1).padStart(2, '0');
      const dd = String(hoy.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    })(),
    OD: '',
    Tratamiento: '',
    Costo: 0
  };
  mostrarFormEvolucion = false;
  guardandoEvolucion = false;


  ngOnInit() {
    this.cargarDatosMedico();
    // Inicia el proceso de carga, que a su vez llama a los demás cargadores.
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
        // Asumiendo que el género viene en PacienteDetalle
        this.esPacienteMujer = data?.Sexo === 'F'; 
        
        // Cargar datos adicionales usando forkJoin para cargar tipos y guardados en paralelo
        this.cargarDatosAntecedentes();

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
  // ANTECEDENTES PERSONALES (LOGICA COMPLETA)
  // ===================================
  
  private cargarDatosAntecedentes() {
    // Carga los tipos de antecedentes (el checklist de enfermedades)
    // y los valores guardados del paciente en paralelo.
    forkJoin({
      tipos: this.api.getTiposAntecedente(), // Lista completa (IDs 1-25)
      guardados: this.api.getAntecedentesMedicos(this.pacienteId) // Valores 0/1 guardados
    }).subscribe({
      next: (data) => {
        // FIX: Filtrar la lista de tipos para asegurar que solo los items del checklist (IDs 1-16) se usen aquí.
        // Esto evita que las nuevas preguntas (IDs 17-25) aparezcan en el checklist dinámico.
        this.tiposAntecedente = data.tipos.filter(t => t.ID_Tipo <= 16); 
        
        this.procesarAntecedentesGuardados(data.guardados);
        this.cargando = false; 
      },
      error: (err) => {
        console.error('Error al cargar tipos/valores de antecedentes:', err);
        this.cargando = false;
      }
    });
  }

  private procesarAntecedentesGuardados(antecedentes: AntecedentePaciente[]) {
    // 1. Crear un mapa inverso para buscar la clave de 'otrasPreguntas' a partir del ID
    const mapInverso = Object.keys(this.ANTECEDENTE_MAP).reduce((acc, key) => {
      acc[this.ANTECEDENTE_MAP[key]] = key;
      return acc;
    }, {} as { [key: number]: string });

    antecedentes.forEach(a => {
      // Intentar mapear a las preguntas específicas (otrasPreguntas)
      const keyOtras = mapInverso[a.ID_Tipo];
      if (keyOtras) {
        // Asignar el valor booleano a la propiedad correspondiente en otrasPreguntas
        if (Object.prototype.hasOwnProperty.call(this.otrasPreguntas, keyOtras)) {
             this.otrasPreguntas[keyOtras as keyof typeof this.otrasPreguntas] = !!a.Valor;
        }
      } else {
        // Mapear al checklist principal (Anemia, Diabetes, etc.)
        this.antecedentesSeleccionados[a.ID_Tipo] = !!a.Valor;
      }
    });
  }

guardarAntecedentesPersonales() {
  this.guardandoAntecedentes = true;
  this.notificacion = { mensaje: '', tipo: null }; // Limpiar notificación

  const payloadChecklist = this.tiposAntecedente.map(tipo => ({
    ID_Tipo: tipo.ID_Tipo,
    Valor: this.antecedentesSeleccionados[tipo.ID_Tipo] ? 1 : 0
  }));

  const payloadOtras = Object.keys(this.otrasPreguntas)
    .filter(key => !(key === 'embarazada' && !this.esPacienteMujer))
    .map(key => ({
      ID_Tipo: this.ANTECEDENTE_MAP[key],
      Valor: this.otrasPreguntas[key as keyof typeof this.otrasPreguntas] ? 1 : 0
    }));

  const payloadCompleto = [...payloadChecklist, ...payloadOtras];

  this.api.updateAntecedentesMedicos(this.pacienteId, payloadCompleto).subscribe({
    next: (res) => {
      if (res.ok) {
        this.notificacion = { mensaje: 'Antecedentes personales guardados exitosamente.', tipo: 'success' };
        alert('¡Antecedentes personales guardados correctamente!'); // <-- Alerta del navegador
      } else {
        this.notificacion = { mensaje: 'Error al guardar antecedentes personales (Respuesta no OK).', tipo: 'error' };
        alert('Ocurrió un error al guardar los antecedentes.'); // <-- Alerta del navegador
      }
      this.guardandoAntecedentes = false;
    },
    error: (err) => {
      console.error('Error al guardar antecedentes:', err);
      this.notificacion = { mensaje: 'Error al guardar antecedentes personales. Verifique la consola.', tipo: 'error' };
      alert('Ocurrió un error al guardar los antecedentes. Verifique la consola.');
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
          if (data.Ultima_Visita && typeof data.Ultima_Visita === 'string' && data.Ultima_Visita.includes('T')) {
            data.Ultima_Visita = data.Ultima_Visita.split('T')[0];
          }
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