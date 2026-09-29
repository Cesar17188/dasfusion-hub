import { Component, signal, HostListener, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.component.html'
})
export class NavbarComponent {
  authService = inject(AuthService);
  private router = inject(Router);

  isScrolled = signal(false);
  isMobileMenuOpen = signal(false);
  isUserMenuOpen = signal(false);

  constructor() {
    // Lock/unlock body scroll on mobile when menu opens
    effect(() => {
      if (typeof document !== 'undefined') {
        if (this.isMobileMenuOpen()) {
          document.body.style.overflow = 'hidden';
        } else {
          document.body.style.overflow = '';
        }
      }
    });
  }

  @HostListener('window:scroll')
  onWindowScroll() {
    if (typeof window !== 'undefined') {
      this.isScrolled.set(window.scrollY > 15);
    }
  }

  @HostListener('window:resize')
  onWindowResize() {
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      if (this.isMobileMenuOpen()) {
        this.closeMobileMenu();
      }
    }
  }

  @HostListener('document:keydown.escape')
  onEscapePressed() {
    this.closeMobileMenu();
    this.closeUserMenu();
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen.update(v => !v);
  }

  closeMobileMenu() {
    this.isMobileMenuOpen.set(false);
  }

  toggleUserMenu() {
    this.isUserMenuOpen.update(v => !v);
  }

  closeUserMenu() {
    this.isUserMenuOpen.set(false);
  }

  navigateToSection(sectionId: string, event?: Event) {
    if (event) {
      event.preventDefault();
    }
    this.closeMobileMenu();

    if (typeof window !== 'undefined') {
      const isLandingPage = window.location.pathname === '/' || window.location.pathname === '';
      const element = document.getElementById(sectionId);

      if (isLandingPage && element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        window.history.replaceState(null, '', `#${sectionId}`);
      } else {
        this.router.navigate(['/'], { fragment: sectionId }).then(() => {
          setTimeout(() => {
            const targetEl = document.getElementById(sectionId);
            if (targetEl) {
              targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }, 150);
        });
      }
    }
  }

  async logout() {
    this.closeUserMenu();
    this.closeMobileMenu();
    await this.authService.signOut();
  }
}


