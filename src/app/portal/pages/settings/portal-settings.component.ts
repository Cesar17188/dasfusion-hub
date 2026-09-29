import { Component, inject, signal, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-portal-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './portal-settings.component.html'
})
export class PortalSettingsComponent implements OnInit {
  authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  isSubmitting = signal(false);
  isSuccess = signal(false);
  errorMessage = signal<string | null>(null);

  settingsForm: FormGroup = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]],
    company: ['', [Validators.maxLength(80)]],
    professionalTitle: ['', [Validators.maxLength(80)]],
    phone: ['', [Validators.maxLength(30)]],
    bio: ['', [Validators.maxLength(500)]],
    allowMarketingEmails: [true],
    emailNotifications: [true]
  });

  constructor() {
    effect(() => {
      const user = this.authService.currentUser();
      const profile = this.authService.currentProfile();
      if (user) {
        this.populateFormData();
      }
    });
  }

  ngOnInit() {
    this.populateFormData();
  }

  private populateFormData() {
    const user = this.authService.currentUser();
    const profile = this.authService.currentProfile();
    const meta = user?.user_metadata || {};

    this.settingsForm.patchValue({
      fullName: profile?.full_name || meta['full_name'] || user?.email?.split('@')[0] || '',
      company: meta['company'] || '',
      professionalTitle: profile?.professional_title || meta['professional_title'] || '',
      phone: meta['phone'] || '',
      bio: profile?.bio || meta['bio'] || '',
      allowMarketingEmails: this.authService.allowMarketingEmails(),
      emailNotifications: this.authService.emailNotifications()
    });
  }

  async onSave() {
    if (this.settingsForm.invalid || this.isSubmitting()) {
      this.settingsForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    this.isSuccess.set(false);

    const val = this.settingsForm.value;

    try {
      await this.authService.updateUserProfile({
        fullName: val.fullName.trim(),
        company: val.company?.trim() || '',
        professionalTitle: val.professionalTitle?.trim() || '',
        phone: val.phone?.trim() || '',
        bio: val.bio?.trim() || '',
        allowMarketingEmails: Boolean(val.allowMarketingEmails),
        emailNotifications: Boolean(val.emailNotifications)
      });

      this.isSuccess.set(true);
      setTimeout(() => {
        this.isSuccess.set(false);
      }, 5000);
    } catch (err: any) {
      console.error('Error saving user profile settings:', err);
      this.errorMessage.set(err?.message || 'No se pudieron guardar los cambios. Intenta nuevamente.');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  toggleMarketingEmails() {
    const current = this.settingsForm.get('allowMarketingEmails')?.value;
    this.settingsForm.get('allowMarketingEmails')?.setValue(!current);
    this.settingsForm.markAsDirty();
  }

  toggleEmailNotifications() {
    const current = this.settingsForm.get('emailNotifications')?.value;
    this.settingsForm.get('emailNotifications')?.setValue(!current);
    this.settingsForm.markAsDirty();
  }

  async logout() {
    await this.authService.signOut();
    this.router.navigate(['/']);
  }
}
