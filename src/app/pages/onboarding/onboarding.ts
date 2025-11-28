import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Api } from '../../services/api';
import { AuthService } from '@auth0/auth0-angular';
import { CedulaVerificationService } from '../../services/cedula-verification.service';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './onboarding.html',
  styleUrl: './onboarding.css'
})
export class Onboarding implements OnInit {
  private api = inject(Api);
  private router = inject(Router);
  private auth = inject(AuthService);
  private cedulaService = inject(CedulaVerificationService);

  selectedRole: 'Medico' | 'Paciente' | null = null;
  isSubmitting = false;
  isVerifyingCedula = false;
  cedulaVerified = false;

  // Datos para Médico
  medicoData = {
    nombre: '',
    apellidos: '',
    telefono: '',
    correo: '',
    cedula: '',
    experiencia: 0
  };

  // Datos para Paciente
  pacienteData = {
    nombre: '',
    sexo: '',
    fechaNacimiento: '',
    direccion: '',
    codigoPostal: '',
    ciudad: '',
    ocupacion: '',
    telefono: '',
    correo: ''
  };

  // Errores de validación
  errors: any = {};

  ngOnInit() {
    document.body.classList.add('hide-layout');
    // Obtener el correo del usuario autenticado de Auth0
    this.auth.user$.subscribe(user => {
      if (user?.email) {
        this.medicoData.correo = user.email;
        this.pacienteData.correo = user.email;
      }
    });
  }

  selectRole(role: 'Medico' | 'Paciente') {
    this.selectedRole = role;
    this.errors = {}; // Limpiar errores al cambiar de rol
    this.cedulaVerified = false;
  }

  // Validaciones
  validateNombre(value: string, fieldName: string): boolean {
    const pattern = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;
    if (!value || value.trim().length === 0) {
      this.errors[fieldName] = 'Este campo es obligatorio';
      return false;
    }
    if (value.length < 2 || value.length > 50) {
      this.errors[fieldName] = 'Debe tener entre 2 y 50 caracteres';
      return false;
    }
    if (!pattern.test(value)) {
      this.errors[fieldName] = 'Solo se permiten letras, espacios y acentos';
      return false;
    }
    delete this.errors[fieldName];
    return true;
  }

  validateTelefono(value: string): boolean {
    const pattern = /^\d{10}$/;
    if (!value) {
      this.errors.telefono = 'El teléfono es obligatorio';
      return false;
    }
    if (!pattern.test(value)) {
      this.errors.telefono = 'Debe contener exactamente 10 dígitos';
      return false;
    }
    delete this.errors.telefono;
    return true;
  }

  validateCorreo(value: string): boolean {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value) {
      this.errors.correo = 'El correo es obligatorio';
      return false;
    }
    if (value.length > 100) {
      this.errors.correo = 'El correo no puede exceder 100 caracteres';
      return false;
    }
    if (!pattern.test(value)) {
      this.errors.correo = 'Formato de correo inválido';
      return false;
    }
    delete this.errors.correo;
    return true;
  }

  validateCedula(value: string): boolean {
    const pattern = /^[a-zA-Z0-9]+$/;
    if (!value) {
      this.errors.cedula = 'La cédula profesional es obligatoria';
      return false;
    }
    if (value.length < 5 || value.length > 10) {
      this.errors.cedula = 'Debe tener entre 5 y 10 caracteres';
      return false;
    }
    if (!pattern.test(value)) {
      this.errors.cedula = 'Solo se permiten letras y números';
      return false;
    }
    delete this.errors.cedula;
    return true;
  }

  validateExperiencia(value: number): boolean {
    if (value === null || value === undefined) {
      this.errors.experiencia = 'Los años de experiencia son obligatorios';
      return false;
    }
    if (value < 0 || value > 60) {
      this.errors.experiencia = 'Debe estar entre 0 y 60 años';
      return false;
    }
    delete this.errors.experiencia;
    return true;
  }

  validateCodigoPostal(value: string): boolean {
    const pattern = /^\d{5}$/;
    if (!value) {
      this.errors.codigoPostal = 'El código postal es obligatorio';
      return false;
    }
    if (!pattern.test(value)) {
      this.errors.codigoPostal = 'Debe contener exactamente 5 dígitos';
      return false;
    }
    delete this.errors.codigoPostal;
    return true;
  }

  validateFechaNacimiento(value: string): boolean {
    if (!value) {
      this.errors.fechaNacimiento = 'La fecha de nacimiento es obligatoria';
      return false;
    }
    const fecha = new Date(value);
    const hoy = new Date();
    if (fecha > hoy) {
      this.errors.fechaNacimiento = 'La fecha no puede ser futura';
      return false;
    }
    delete this.errors.fechaNacimiento;
    return true;
  }

  validateDireccion(value: string): boolean {
    if (!value || value.trim().length === 0) {
      this.errors.direccion = 'La dirección es obligatoria';
      return false;
    }
    if (value.length < 5 || value.length > 100) {
      this.errors.direccion = 'Debe tener entre 5 y 100 caracteres';
      return false;
    }
    delete this.errors.direccion;
    return true;
  }

  validateSexo(value: string): boolean {
    if (!value) {
      this.errors.sexo = 'El sexo es obligatorio';
      return false;
    }
    delete this.errors.sexo;
    return true;
  }

  /**
   * Verificar cédula profesional con la SEP
   */
  verificarCedulaProfesional() {
    if (!this.validateCedula(this.medicoData.cedula)) {
      return;
    }

    if (!this.validateNombre(this.medicoData.nombre, 'nombre') || 
        !this.validateNombre(this.medicoData.apellidos, 'apellidos')) {
      alert('Por favor completa el nombre y apellidos antes de verificar la cédula');
      return;
    }

    this.isVerifyingCedula = true;
    this.cedulaVerified = false;
    delete this.errors.cedula;

    // OPCIÓN 1: Usar API pública de la SEP (puedes cambiar por otra opción)
    this.cedulaService.verificarCedula(
      this.medicoData.cedula,
      this.medicoData.nombre,
      this.medicoData.apellidos
    ).subscribe({
      next: (result) => {
        this.isVerifyingCedula = false;
        
        if (result.isValid && result.data) {
          this.cedulaVerified = true;
          alert(`✅ Cédula verificada correctamente\n\nProfesión: ${result.data.profesion}\nInstitución: ${result.data.institucion}`);
          
          // Opcional: Autocompletar datos si coinciden
          if (result.data.nombre && result.data.apellidos) {
            const confirmAutoComplete = confirm('¿Deseas usar los datos registrados en la SEP?');
            if (confirmAutoComplete) {
              this.medicoData.nombre = result.data.nombre;
              this.medicoData.apellidos = result.data.apellidos;
            }
          }
        } else {
          this.errors.cedula = result.error || 'No se pudo verificar la cédula';
          alert('❌ ' + this.errors.cedula + '\n\nPor favor verifica que:\n- La cédula sea correcta\n- El nombre y apellidos coincidan con el registro\n- El registro esté actualizado en la SEP');
        }
      },
      error: (error) => {
        this.isVerifyingCedula = false;
        this.errors.cedula = 'Error al verificar la cédula. Intenta nuevamente.';
        console.error('Error en verificación de cédula:', error);
      }
    });
  }

  validateMedicoForm(): boolean {
    let isValid = true;
    
    isValid = this.validateNombre(this.medicoData.nombre, 'nombre') && isValid;
    isValid = this.validateNombre(this.medicoData.apellidos, 'apellidos') && isValid;
    isValid = this.validateTelefono(this.medicoData.telefono) && isValid;
    isValid = this.validateCorreo(this.medicoData.correo) && isValid;
    isValid = this.validateCedula(this.medicoData.cedula) && isValid;
    isValid = this.validateExperiencia(this.medicoData.experiencia) && isValid;

    // Verificar que la cédula haya sido verificada
    if (!this.cedulaVerified) {
      this.errors.cedula = 'Debes verificar tu cédula profesional antes de continuar';
      isValid = false;
    }
    return isValid;
  }

  validatePacienteForm(): boolean {
    let isValid = true;
    
    isValid = this.validateNombre(this.pacienteData.nombre, 'nombre') && isValid;
    isValid = this.validateSexo(this.pacienteData.sexo) && isValid;
    isValid = this.validateFechaNacimiento(this.pacienteData.fechaNacimiento) && isValid;
    isValid = this.validateDireccion(this.pacienteData.direccion) && isValid;
    isValid = this.validateCodigoPostal(this.pacienteData.codigoPostal) && isValid;
    isValid = this.validateNombre(this.pacienteData.ciudad, 'ciudad') && isValid;
    isValid = this.validateTelefono(this.pacienteData.telefono) && isValid;
    isValid = this.validateCorreo(this.pacienteData.correo) && isValid;
    
    // Ocupación es opcional, pero si tiene valor, debe ser válida
    if (this.pacienteData.ocupacion) {
      isValid = this.validateNombre(this.pacienteData.ocupacion, 'ocupacion') && isValid;
    }

    return isValid;
  }

  onSubmit() {
    if (!this.selectedRole) {
      alert('Por favor selecciona un rol');
      return;
    }

    if (this.isSubmitting) return;

    // Validar según el rol
    const isValid = this.selectedRole === 'Medico' 
      ? this.validateMedicoForm() 
      : this.validatePacienteForm();

    if (!isValid) {
      alert('Por favor corrige los errores en el formulario');
      return;
    }

    const data = this.selectedRole === 'Medico' ? this.medicoData : this.pacienteData;

    this.isSubmitting = true;

    this.api.registerProfile(this.selectedRole, data).subscribe({
      next: (response) => {
        console.log('Perfil registrado:', response);
        
        // Redirigir según el rol
        if (this.selectedRole === 'Medico') {
          this.router.navigate(['/dashboard-medico']);
        } else {
          this.router.navigate(['/home']);
        }
      },
      error: (error) => {
        console.error('Error al registrar perfil:', error);
        alert('Error al registrar el perfil. Por favor intenta de nuevo.');
        this.isSubmitting = false;
      }
    });
  }
}