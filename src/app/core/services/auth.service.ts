import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';
import { Profile } from '../models/database.types';

export interface SignUpClientData {
  email: string;
  password: string;
  fullName: string;
  company?: string;
  phone?: string;
  allowMarketingEmails?: boolean;
}

export interface UpdateProfileData {
  fullName: string;
  company?: string;
  professionalTitle?: string;
  bio?: string;
  phone?: string;
  allowMarketingEmails?: boolean;
  emailNotifications?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private supabaseService = inject(SupabaseService);
  private router = inject(Router);

  readonly currentUser = signal<User | null>(null);
  readonly currentProfile = signal<Profile | null>(null);
  readonly isLoading = signal<boolean>(true);

  readonly isAuthenticated = computed(() => !!this.currentUser());
  readonly userFullName = computed(() => {
    return this.currentProfile()?.full_name || 
           this.currentUser()?.user_metadata?.['full_name'] || 
           this.currentUser()?.email?.split('@')[0] || 
           'Cliente';
  });

  readonly userRole = computed(() => {
    return this.currentProfile()?.role || 
           this.currentUser()?.user_metadata?.['role'] || 
           'client';
  });

  readonly userEmail = computed(() => this.currentUser()?.email || '');
  readonly userCompany = computed(() => {
    return this.currentUser()?.user_metadata?.['company'] || '';
  });
  readonly userPhone = computed(() => {
    return this.currentUser()?.user_metadata?.['phone'] || '';
  });
  readonly allowMarketingEmails = computed(() => {
    const meta = this.currentUser()?.user_metadata;
    if (meta && typeof meta['allow_marketing_emails'] === 'boolean') {
      return meta['allow_marketing_emails'];
    }
    return true; // Predeterminado activo con aviso previo
  });
  readonly emailNotifications = computed(() => {
    const meta = this.currentUser()?.user_metadata;
    if (meta && typeof meta['email_notifications'] === 'boolean') {
      return meta['email_notifications'];
    }
    return true;
  });

  constructor() {
    this.initAuth();
  }

  private async initAuth() {
    try {
      const session = await this.supabaseService.getSession();
      if (session?.user) {
        this.currentUser.set(session.user);
        await this.syncAndFetchProfile(session.user);
      }
    } catch (err) {
      console.error('Error initializing auth session:', err);
    } finally {
      this.isLoading.set(false);
    }

    // Subscribe to auth changes
    this.supabaseService.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      const user = session?.user ?? null;
      this.currentUser.set(user);

      if (user) {
        await this.syncAndFetchProfile(user);
      } else {
        this.currentProfile.set(null);
      }
      this.isLoading.set(false);
    });
  }

  /**
   * Sincroniza y asegura que exista el perfil del cliente con rol 'client' en la tabla profiles
   */
  async syncAndFetchProfile(user: User): Promise<Profile | null> {
    try {
      const existing = await this.supabaseService.getProfile(user.id);
      if (existing) {
        // Si no tenía rol en base de datos, asegurarse de asignar 'client'
        if (!existing.role) {
          try {
            const updated = await this.supabaseService.updateProfile(user.id, { role: 'client' });
            this.currentProfile.set(updated);
            return updated;
          } catch {
            // fallback
          }
        }
        this.currentProfile.set(existing);
        return existing;
      }

      // If profile does not exist yet (e.g. Google OAuth new user or fresh signup), create it with role client
      const role = (user.user_metadata?.['role'] as string) || 'client';
      const fullName = user.user_metadata?.['full_name'] || 
                       user.user_metadata?.['name'] || 
                       user.email?.split('@')[0] || 
                       'Cliente DASFusion';
      const company = user.user_metadata?.['company'] || '';
      const avatarUrl = user.user_metadata?.['avatar_url'] || 
                        user.user_metadata?.['picture'] || 
                        null;

      const newProfile: Profile = {
        id: user.id,
        full_name: fullName,
        professional_title: company ? `Cliente / ${company}` : 'Cliente DASFusion',
        bio: 'Cliente registrado en DASFusion Hub',
        avatar_url: avatarUrl,
        role: role,
        created_at: new Date().toISOString()
      };

      const { data, error } = await this.supabaseService.client
        .from('profiles')
        .upsert(newProfile)
        .select()
        .single();

      if (error) {
        console.warn('Could not upsert profile directly:', error.message);
        this.currentProfile.set(newProfile);
        return newProfile;
      }

      this.currentProfile.set(data);
      return data;
    } catch (err) {
      console.error('Error syncing profile:', err);
      return null;
    }
  }

  /**
   * Registro con correo y contraseña para clientes
   */
  async signUpWithEmail(data: SignUpClientData) {
    const redirectUrl = typeof window !== 'undefined' 
      ? `${window.location.origin}/auth/callback` 
      : 'https://dasfusion.ec/auth/callback';

    const { data: authData, error } = await this.supabaseService.client.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: data.fullName,
          company: data.company || '',
          phone: data.phone || '',
          allow_marketing_emails: data.allowMarketingEmails ?? true,
          email_notifications: true,
          role: 'client'
        }
      }
    });

    if (error) throw error;

    if (authData.user) {
      this.currentUser.set(authData.user);
      // Create initial client profile
      await this.syncAndFetchProfile(authData.user);
    }

    return authData;
  }

  /**
   * Actualiza la información del perfil del usuario y sus preferencias de correo
   */
  async updateUserProfile(data: UpdateProfileData) {
    const user = this.currentUser();
    if (!user) throw new Error('No hay usuario autenticado');

    // 1. Actualizar metadata en Supabase Auth
    const { data: updatedAuth, error: authErr } = await this.supabaseService.client.auth.updateUser({
      data: {
        full_name: data.fullName,
        company: data.company || '',
        phone: data.phone || '',
        professional_title: data.professionalTitle || '',
        bio: data.bio || '',
        allow_marketing_emails: data.allowMarketingEmails ?? true,
        email_notifications: data.emailNotifications ?? true
      }
    });

    if (authErr) throw authErr;

    if (updatedAuth.user) {
      this.currentUser.set(updatedAuth.user);
    }

    // 2. Actualizar tabla profiles
    try {
      const updatedProfile = await this.supabaseService.updateProfile(user.id, {
        full_name: data.fullName,
        professional_title: data.professionalTitle || (data.company ? `Cliente / ${data.company}` : 'Cliente DASFusion'),
        bio: data.bio || ''
      });
      if (updatedProfile) {
        this.currentProfile.set(updatedProfile);
      }
    } catch (e) {
      console.warn('Profile row update notice (metadata updated successfully):', e);
    }

    return updatedAuth.user;
  }

  /**
   * Inicio de sesión con correo y contraseña
   */
  async signInWithEmail(email: string, password: string) {
    const { data, error } = await this.supabaseService.client.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    if (data.user) {
      this.currentUser.set(data.user);
      await this.syncAndFetchProfile(data.user);
    }

    return data;
  }

  /**
   * Inicio de sesión / Registro en 1 clic con Google OAuth
   */
  async signInWithGoogle() {
    const redirectUrl = typeof window !== 'undefined' 
      ? `${window.location.origin}/auth/callback` 
      : 'https://dasfusion.ec/auth/callback';

    const { data, error } = await this.supabaseService.client.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent'
        }
      }
    });

    if (error) throw error;
    return data;
  }

  /**
   * Cierre de sesión seguro
   */
  async signOut() {
    try {
      await this.supabaseService.signOut();
    } finally {
      this.currentUser.set(null);
      this.currentProfile.set(null);
      this.router.navigate(['/']);
    }
  }
}
