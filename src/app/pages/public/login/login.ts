import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  email: string = '';     
  password: string = '';  

  onLogin() {
    console.log('Email:', this.email);
    console.log('Password:', this.password);
    alert('Login exitoso (simulado)');
  }
  
}
