import { Routes } from '@angular/router';
import { LandingPageComponent } from './features/landing/pages/landing-page/landing-page.component';
import { authGuard } from './core/guards/auth.guard';

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
    path: 'portal',
    canActivate: [authGuard],
    loadComponent: () => import('./portal/layout/portal-layout.component').then(m => m.PortalLayoutComponent),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./portal/pages/dashboard/portal-dashboard.component').then(m => m.PortalDashboardComponent),
        title: 'Dashboard de Proyectos | DASFusion Portal'
      },
      {
        path: 'projects',
        loadComponent: () => import('./portal/pages/projects/portal-projects.component').then(m => m.PortalProjectsComponent),
        title: 'Administrar Proyectos | DASFusion Portal'
      },
      {
        path: 'kanban',
        loadComponent: () => import('./portal/pages/kanban/portal-kanban.component').then(m => m.PortalKanbanComponent),
        title: 'Tablero Kanban de Fases | DASFusion Portal'
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];

