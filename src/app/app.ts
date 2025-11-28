import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Navbar } from './shared/components/navbar/navbar';
import { Footer } from './shared/components/footer/footer';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true, 
  imports: [RouterOutlet, Navbar, Footer, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'consultorioDental';
  isLoginPage: boolean; 

  constructor(private router: Router) {

    const shouldHideNavbar = (url: string): boolean => {
      const rutasSinNavbar = [
        '/login',
        '/',
        '/callback',
        '/dashboard-medico',
        '/citas-medico',
        '/historial-clinico'
      ];
      
      return rutasSinNavbar.some(ruta => 
        url === ruta || url.startsWith(ruta)
      );
    };

    // 1. ESTABLECER ESTADO INICIAL (al cargar la página, sin esperar eventos)
    const initialUrl = this.router.url;
    this.isLoginPage = shouldHideNavbar(initialUrl);

    // 2. SUSCRIBIRSE A CAMBIOS FUTUROS (navegación interna)
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const currentUrl = event.url;
        this.isLoginPage = shouldHideNavbar(currentUrl);
      }
    });
  }
}