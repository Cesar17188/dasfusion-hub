import { Routes } from '@angular/router';
import { LandingPageComponent } from './features/landing/pages/landing-page/landing-page.component';

export const routes: Routes = [
  {
    path: '',
    component: LandingPageComponent,
    title: 'DASFusion Core - Enterprise Software & AI Engineering'
  },
  {
    path: '**',
    redirectTo: ''
  }
];
