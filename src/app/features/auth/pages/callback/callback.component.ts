import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { SupabaseService } from '../../../../core/services/supabase.service';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 bg-background">
      <div class="max-w-md w-full text-center space-y-4 p-8 rounded-3xl bg-surface-container/80 border border-outline-variant/80 shadow-2xl backdrop-blur-xl">
        
        @if (errorMessage()) {
          <div class="w-14 h-14 bg-error-container text-error rounded-2xl mx-auto flex items-center justify-center">
            <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
          </div>
          <h2 class="text-xl font-bold text-on-surface">Error de Autenticación</h2>
          <p class="text-xs text-on-surface-variant">{{ errorMessage() }}</p>
          <button 
            (click)="goToLogin()" 
            class="mt-4 px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs hover:bg-primary-fixed transition-all cursor-pointer">
            Volver a Iniciar Sesión
          </button>
        } @else {
          <div class="relative w-14 h-14 mx-auto flex items-center justify-center">
            <div class="w-14 h-14 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
          </div>
          <h2 class="text-lg font-bold text-on-surface">Autenticando con Google...</h2>
          <p class="text-xs text-on-surface-variant">Sincronizando tus datos de cliente en DASFusion Hub</p>
        }

      </div>
    </div>
  `
})
export class AuthCallbackComponent implements OnInit {
  private authService = inject(AuthService);
  private supabaseService = inject(SupabaseService);
  private router = inject(Router);

  errorMessage = signal<string | null>(null);

  async ngOnInit() {
    try {
      // Get the session from URL tokens or active exchange
      const session = await this.supabaseService.getSession();
      
      if (session?.user) {
        // Ensure profile exists in profiles table
        await this.authService.syncAndFetchProfile(session.user);
        this.router.navigate(['/']);
        return;
      }

      // Check if session arrives via auth state change listener
      const sub = this.supabaseService.onAuthStateChange(async (event, currentSession) => {
        if (currentSession?.user) {
          sub.data.subscription.unsubscribe();
          await this.authService.syncAndFetchProfile(currentSession.user);
          this.router.navigate(['/']);
        }
      });

      // Timeout fallback if no session received
      setTimeout(() => {
        if (!this.authService.isAuthenticated()) {
          this.router.navigate(['/']);
        }
      }, 4000);

    } catch (err: any) {
      console.error('Callback error:', err);
      this.errorMessage.set(err?.message || 'No se pudo completar la autenticación.');
    }
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
