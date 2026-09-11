import { Routes } from '@angular/router';
import { LandingPageComponent } from './features/landing/pages/landing-page/landing-page.component';

export const routes: Routes = [
  {
    path: '',
    component: LandingPageComponent,
    title: 'DASFusion Core - Enterprise Software & AI Engineering'
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/pages/login/login.component').then(m => m.LoginComponent),
    title: 'Iniciar Sesión | Portal de Clientes DASFusion'
  },
  {
    path: 'signup',
    loadComponent: () => import('./features/auth/pages/signup/signup.component').then(m => m.SignupComponent),
    title: 'Crear Cuenta de Cliente | DASFusion Hub'
  },
  {
    path: 'auth/callback',
    loadComponent: () => import('./features/auth/pages/callback/callback.component').then(m => m.AuthCallbackComponent),
    title: 'Autenticando | DASFusion Hub'
  },
  {
    path: '**',
    redirectTo: ''
  }
];
