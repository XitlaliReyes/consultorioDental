import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { take } from 'rxjs/operators';

interface Service {
  title: string;
  description: string;
  image: string;
  icon: string;
}

interface CarouselImage {
  src: string;
  alt: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})

export class Home implements OnInit {
  private router = inject(Router);
  private auth = inject(AuthService);
  
  showAlert = false;
  current = 0;

  // TUS IMÁGENES ORIGINALES DEL CARRUSEL
  images: CarouselImage[] = [
    { 
      src: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?q=80&w=1974&auto=format&fit=crop', 
      alt: 'Clínica dental moderna' 
    },
    { 
      src: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=2070&auto=format&fit=crop', 
      alt: 'Equipo profesional' 
    },
    { 
      src: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=2068&auto=format&fit=crop', 
      alt: 'Tecnología avanzada' 
    }
  ];

  // TUS SERVICIOS ORIGINALES
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

  ngOnInit(): void {
    this.startCarousel();
  }

  startCarousel(): void {
    setInterval(() => {
      this.next();
    }, 5000);
  }

  next(): void {
    this.current = (this.current + 1) % this.images.length;
  }

  prev(): void {
    this.current = this.current === 0 
      ? this.images.length - 1 
      : this.current - 1;
  }

  irACitas(): void {
    this.auth.isAuthenticated$.pipe(take(1)).subscribe(isAuth => {
      if (isAuth) {
        this.router.navigate(['/citas']);
      } else {
        this.mostrarAlerta();
      }
    });
  }

  irNosotros(): void {
    this.router.navigate(['/nosotros']);
  }
  mostrarAlerta(): void {
    this.showAlert = true;
    setTimeout(() => {
      this.showAlert = false;
    }, 4000);
  }

  cerrarAlerta(): void {
    this.showAlert = false;
  }

  irALogin(): void {
    this.showAlert = false;
    this.auth.loginWithRedirect();
  }
}