import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';

export function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');

  if (password && confirmPassword && password.value !== confirmPassword.value) {
    confirmPassword.setErrors({ passwordMismatch: true });
    return { passwordMismatch: true };
  }
  return null;
}

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './signup.component.html'
})
export class SignupComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  isSubmitting = signal(false);
  isGoogleLoading = signal(false);
  isSuccess = signal(false);
  showPassword = signal(false);
  errorMessage = signal<string | null>(null);

  signupForm: FormGroup = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    company: [''],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]],
    acceptTerms: [true, [Validators.requiredTrue]]
  }, { validators: passwordMatchValidator });

  togglePasswordVisibility() {
    this.showPassword.update(val => !val);
  }

  async onSubmit() {
    if (this.signupForm.invalid || this.isSubmitting()) return;

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const { fullName, company, email, password } = this.signupForm.value;

    try {
      const res = await this.authService.signUpWithEmail({
        email,
        password,
        fullName,
        company
      });

      // If user session is created immediately (Supabase auto-confirm enabled or session returned)
      if (res.session) {
        this.router.navigate(['/portal/dashboard']);
      } else {
        // Email confirmation is required by Supabase auth configuration
        this.isSuccess.set(true);
      }
    } catch (err: any) {
      console.error('Signup error:', err);
      let message = 'Error al registrar cliente. Por favor, intenta de nuevo.';
      if (err?.message?.includes('User already registered')) {
        message = 'Ya existe una cuenta con este correo electrónico. Inicia sesión en su lugar.';
      } else if (err?.message) {
        message = err.message;
      }
      this.errorMessage.set(message);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  async onGoogleSignup() {
    if (this.isGoogleLoading()) return;

    this.isGoogleLoading.set(true);
    this.errorMessage.set(null);

    try {
      await this.authService.signInWithGoogle();
    } catch (err: any) {
      console.error('Google signup error:', err);
      if (err?.message?.includes('provider is not enabled') || err?.message?.includes('Unsupported provider')) {
        this.errorMessage.set('El registro con Google aún no está activado en el panel de Supabase. Activa el proveedor Google en Authentication > Providers.');
      } else {
        this.errorMessage.set(err?.message || 'Error al conectar con Google. Por favor, intenta de nuevo.');
      }
      this.isGoogleLoading.set(false);
    }
  }
}
