import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { SupabaseService } from '../services/supabase.service';

export const authGuard: CanActivateFn = async (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authService = inject(AuthService);
  const supabaseService = inject(SupabaseService);
  const router = inject(Router);

  // If user signal is already populated
  if (authService.isAuthenticated()) {
    return true;
  }

  // Check Supabase session directly to handle page reloads / SSR hydration
  try {
    const session = await supabaseService.getSession();
    if (session?.user) {
      if (!authService.currentUser()) {
        authService.currentUser.set(session.user);
        await authService.syncAndFetchProfile(session.user);
      }
      return true;
    }
  } catch (err) {
    console.error('Error validating auth session in guard:', err);
  }

  // Redirect to login with returnUrl
  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url }
  });
};
