import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import {
  IonContent,
  IonInput,
  IonButton,
  IonIcon,
  IonSpinner,
  IonToast, IonHeader, IonToolbar } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  lockClosedOutline,
  mailOutline,
  personOutline,
  sunnyOutline,
} from 'ionicons/icons';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [IonToolbar, IonHeader, 
    CommonModule,
    FormsModule,
    RouterModule,
    IonContent,
    IonInput,
    IonButton,
    IonIcon,
    IonSpinner,
    IonToast,
  ],
})
export class RegisterPage {
  nombre = '';
  email = '';
  password = '';
  confirmPassword = '';

  loading = false;
  toastOpen = false;
  toastMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    addIcons({
      personOutline,
      mailOutline,
      lockClosedOutline,
      sunnyOutline,
    });
  }

  async register() {
    if (!this.nombre || !this.email || !this.password || !this.confirmPassword) {
      this.showToast('Completa todos los campos.');
      return;
    }

    if (this.password.length < 6) {
      this.showToast('La contraseña debe tener mínimo 6 caracteres.');
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.showToast('Las contraseñas no coinciden.');
      return;
    }

    this.loading = true;

    const { error } = await this.authService.signUp(
      this.nombre.trim(),
      this.email.trim(),
      this.password
    );

    this.loading = false;

    if (error) {
      this.showToast(error.message);
      return;
    }

    this.showToast('Cuenta creada. Ahora inicia sesión.');

    setTimeout(() => {
      this.router.navigateByUrl('/login', { replaceUrl: true });
    }, 900);
  }

  showToast(message: string) {
    this.toastMessage = message;
    this.toastOpen = true;
  }
}