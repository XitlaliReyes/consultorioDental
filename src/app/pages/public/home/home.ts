import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { Api } from '../../../services/api';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {
  private auth = inject(AuthService);
  private api = inject(Api);
  private router = inject(Router);
  
  userName: string = '';
  userEmail: string = '';

  images = [
    { src: 'https://images.unsplash.com/photo-1642844819197-5f5f21b89ff8', alt: 'Consultorio dental moderno' },
    { src: 'https://images.unsplash.com/photo-1683520701490-7172fa20c8f1', alt: 'Familia feliz en el dentista' },
    { src: 'https://images.unsplash.com/photo-1565090567208-c8038cfcf6cd', alt: 'Dentista profesional' }
  ];
  current = 0;

  ngOnInit() {
    // Obtener información del usuario
    this.api.getRole().subscribe({
        next: (response) => {   // response tiene tipo ProfileRoleResponse | null
          if (response) {       // filtramos null
            this.userName = response.nombre;
            this.userEmail = response.correo || '';
          } else {
            console.warn('No hay datos de usuario');
          }
        },
        error: (error: any) => {
          console.error('Error al obtener datos del usuario:', error);
        }
    });

  }

  next() { 
    this.current = (this.current + 1) % this.images.length; 
  }
  
  prev() { 
    this.current = (this.current - 1 + this.images.length) % this.images.length; 
  }
  
  trackByTitle(index: number, service: any): string {
    return service.title;
  }

  irACitas() {
    this.router.navigate(['/citas']);
  }

  irNosotros() {
    this.router.navigate(['/nosotros']);
  }

  services = [
    {
      title: "Limpieza Dental",
      description: "Limpieza profunda y prevención de enfermedades bucales",
      icon: "🧽",
      image: "/images/img10.jpeg"
    },
    {
      title: "Empaste Dental",
      description: "Restauración de piezas dentales dañadas por caries",
      icon: "✨",
      image: "/images/img4.jpeg"
    },
    {
      title: "Extracción Dental",
      description: "Remoción de piezas dentales dañadas o no viables",
      icon: "🦷",
      image: "/images/img7.jpeg"
    },
    {
      title: "Blanqueamiento Dental",
      description: "Tratamiento para aclarar el color de los dientes",
      icon: "🔧",
      image: "/images/img11.jpeg"
    },
    {
      title: "Ortodoncia Inicial",
      description: "Consulta y diagnóstico para tratamiento de ortodoncia",
      icon: "🩺",
      image: "/images/img5.jpeg"
    },
    {
      title: "Revisión Dental",
      description: "Chequeo general para evaluar la salud bucal",
      icon: "💎",
      image: "/images/img1.jpeg"
    }
  ];

  
  
}