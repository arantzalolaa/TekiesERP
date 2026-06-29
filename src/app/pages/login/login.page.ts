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
  IonText,
  IonToast, IonHeader, IonToolbar } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  eyeOffOutline,
  eyeOutline,
  lockClosedOutline,
  mailOutline,
  sunnyOutline,
} from 'ionicons/icons';
import { AuthService } from '../../services/auth.service';
import { ROLE_HOME } from '../../shared/utils/roles';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
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
    IonText,
    IonToast,
  ],
})
export class LoginPage {
  email = '';
  password = '';
  showPassword = false;

  loading = false;
  toastOpen = false;
  toastMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    addIcons({
      mailOutline,
      lockClosedOutline,
      sunnyOutline,
      eyeOutline,
      eyeOffOutline,
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  async login() {
    if (!this.email || !this.password) {
      this.showToast('Ingresa tu correo y contraseña.');
      return;
    }

    this.loading = true;

    const { error } = await this.authService.signIn(
      this.email.trim(),
      this.password
    );

    if (error) {
      this.loading = false;
      this.showToast('Correo o contraseña incorrectos.');
      return;
    }

    const role = await this.authService.getRole();
    const home = role ? ROLE_HOME[role] : '/dashboard';

    this.loading = false;
    await this.router.navigateByUrl(home, { replaceUrl: true });
  }

  showToast(message: string) {
    this.toastMessage = message;
    this.toastOpen = true;
  }
}
