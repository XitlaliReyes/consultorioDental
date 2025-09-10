import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  

  images = [
    { src: 'https://images.unsplash.com/photo-1642844819197-5f5f21b89ff8', alt: 'Consultorio dental moderno' },
    { src: 'https://images.unsplash.com/photo-1683520701490-7172fa20c8f1', alt: 'Familia feliz en el dentista' },
    { src: 'https://images.unsplash.com/photo-1565090567208-c8038cfcf6cd', alt: 'Dentista profesional' }
  ];
  current = 0;

  next() { this.current = (this.current + 1) % this.images.length; }
  prev() { this.current = (this.current - 1 + this.images.length) % this.images.length; }
  
  trackByTitle(index: number, service: any): string {
    return service.title;
  }

  services = [
    {
      title: "Limpieza Dental",
      description: "Limpieza profunda y prevención de enfermedades bucales",
      icon: "🧽",
      image: "https://images.unsplash.com/photo-1629909613638-0e4a1fad8f81?w=300&h=300&fit=crop"
    },
    {
      title: "Blanqueamiento",
      description: "Tratamientos avanzados para una sonrisa más blanca",
      icon: "✨",
      image: "https://images.unsplash.com/photo-1675526607070-f5cbd71dde92?w=300&h=300&fit=crop"
    },
    {
      title: "Ortodoncia",
      description: "Alineación dental con tecnología moderna",
      icon: "🦷",
      image: "https://images.unsplash.com/photo-1642844819197-5f5f21b89ff8?w=300&h=300&fit=crop"
    },
    {
      title: "Implantes",
      description: "Soluciones permanentes para dientes perdidos",
      icon: "🔧",
      image: "https://images.unsplash.com/photo-1629909613638-0e4a1fad8f81?w=300&h=300&fit=crop"
    },
    {
      title: "Endodoncia",
      description: "Tratamiento de conductos con máxima comodidad",
      icon: "🩺",
      image: "https://images.unsplash.com/photo-1629909613638-0e4a1fad8f81?w=300&h=300&fit=crop"
    },
    {
      title: "Estética Dental",
      description: "Diseños de sonrisa personalizados",
      icon: "💎",
      image: "https://images.unsplash.com/photo-1675526607070-f5cbd71dde92?w=300&h=300&fit=crop"
    }
  ];
}
