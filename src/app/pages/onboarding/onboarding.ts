import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Api } from '../../services/api';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './onboarding.html',
  styleUrl: './onboarding.css'
})
export class Onboarding {
  private api = inject(Api);
  private router = inject(Router);

  selectedRole: 'Medico' | 'Paciente' | null = null;
  isSubmitting = false;
  
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

  selectRole(role: 'Medico' | 'Paciente') {
    this.selectedRole = role;
  }

  onSubmit() {
    if (!this.selectedRole) {
      alert('Por favor selecciona un rol');
      return;
    }

    if (this.isSubmitting) return;

    const data = this.selectedRole === 'Medico' ? this.medicoData : this.pacienteData;

    // Validación básica
    if (this.selectedRole === 'Medico') {
      // Usa this.medicoData directamente
      if (!this.medicoData.nombre || !this.medicoData.apellidos || !this.medicoData.cedula) { 
        alert('Por favor completa todos los campos obligatorios');
        return;
      }
    } else {
      // El bloque 'else' es para el Paciente, que ya usa this.pacienteData
      if (!this.pacienteData.nombre || !this.pacienteData.sexo || !this.pacienteData.fechaNacimiento) {
        alert('Por favor completa todos los campos obligatorios');
        return;
      }
    }

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