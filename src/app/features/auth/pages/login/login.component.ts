import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isSubmitting = signal(false);
  isGoogleLoading = signal(false);
  showPassword = signal(false);
  errorMessage = signal<string | null>(null);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rememberMe: [true]
  });

  togglePasswordVisibility() {
    this.showPassword.update(val => !val);
  }

  async onSubmit() {
    if (this.loginForm.invalid || this.isSubmitting()) return;

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const { email, password } = this.loginForm.value;

    try {
      await this.authService.signInWithEmail(email, password);
      const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/portal/dashboard';
      this.router.navigateByUrl(returnUrl);
    } catch (err: any) {
      console.error('Login error:', err);
      let message = 'No se pudo iniciar sesión. Verifica tus credenciales.';
      if (err?.message?.includes('Invalid login credentials')) {
        message = 'Correo o contraseña incorrectos. Por favor, verifica tus datos.';
      } else if (err?.message?.includes('Email not confirmed')) {
        message = 'Por favor, confirma tu correo electrónico antes de ingresar.';
      }
      this.errorMessage.set(message);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  async onGoogleLogin() {
    if (this.isGoogleLoading()) return;

    this.isGoogleLoading.set(true);
    this.errorMessage.set(null);

    try {
      await this.authService.signInWithGoogle();
    } catch (err: any) {
      console.error('Google login error:', err);
      if (err?.message?.includes('provider is not enabled') || err?.message?.includes('Unsupported provider')) {
        this.errorMessage.set('El inicio de sesión con Google aún no está activado en el panel de Supabase. Activa el proveedor Google en Authentication > Providers.');
      } else {
        this.errorMessage.set(err?.message || 'Error al conectar con Google. Por favor, intenta de nuevo.');
      }
      this.isGoogleLoading.set(false);
    }
  }
}
