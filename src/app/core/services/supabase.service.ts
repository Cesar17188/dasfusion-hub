import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, User, AuthChangeEvent, Session } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import {
  Database,
  Competency,
  CaseStudy,
  Lead,
  LeadInsert,
  Proposal,
  Profile,
  ProfileUpdate,
  Project,
  ProjectInsert,
  ProjectUpdate,
} from '../models/database.types';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient<Database>;

  constructor() {
    this.supabase = createClient<Database>(
      environment.supabaseUrl,
      environment.supabaseAnonKey
    );
  }

  /** Direct access to the typed Supabase client */
  get client(): SupabaseClient<Database> {
    return this.supabase;
  }

  /* ==========================================================================
     Auth helpers
     ========================================================================== */

  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await this.supabase.auth.getUser();
    return user;
  }

  async getSession(): Promise<Session | null> {
    const { data: { session } } = await this.supabase.auth.getSession();
    return session;
  }

  onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void) {
    return this.supabase.auth.onAuthStateChange(callback);
  }

  async signOut() {
    return await this.supabase.auth.signOut();
  }

  /* ==========================================================================
     Competencies (Public SELECT)
     ========================================================================== */

  async getCompetencies(): Promise<Competency[]> {
    const { data, error } = await this.supabase
      .from('competencies')
      .select('*')
      .order('category', { ascending: true });

    if (error) throw error;
    return data ?? [];
  }

  async getFeaturedCompetencies(): Promise<Competency[]> {
    const { data, error } = await this.supabase
      .from('competencies')
      .select('*')
      .eq('featured', true);

    if (error) throw error;
    return data ?? [];
  }

  /* ==========================================================================
     Case Studies (Public SELECT)
     ========================================================================== */

  async getCaseStudies(): Promise<CaseStudy[]> {
    const { data, error } = await this.supabase
      .from('case_studies')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data ?? [];
  }

  async getCaseStudyBySlug(slug: string): Promise<CaseStudy | null> {
    const { data, error } = await this.supabase
      .from('case_studies')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  /* ==========================================================================
     Leads (Public INSERT)
     ========================================================================== */

  async createLead(lead: LeadInsert): Promise<Lead> {
    const { data, error } = await this.supabase
      .from('leads')
      .insert(lead)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /* ==========================================================================
     Proposals (Access via access_token)
     ========================================================================== */

  async getProposalByToken(token: string): Promise<Proposal | null> {
    const { data, error } = await this.supabase
      .from('proposals')
      .select('*')
      .eq('access_token', token)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async incrementProposalViewCount(proposalId: string, currentCount: number | null): Promise<void> {
    const nextCount = (currentCount ?? 0) + 1;
    await this.supabase
      .from('proposals')
      .update({ view_count: nextCount })
      .eq('id', proposalId);
  }

  /* ==========================================================================
     Profiles (Public SELECT, Auth Owner UPDATE)
     ========================================================================== */

  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async updateProfile(userId: string, updates: ProfileUpdate): Promise<Profile> {
    const { data, error } = await this.supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /* ==========================================================================
     Projects (Public SELECT, Auth Owner CRUD)
     ========================================================================== */

  async getProjects(): Promise<Project[]> {
    const { data, error } = await this.supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data ?? [];
  }

  async createProject(project: ProjectInsert): Promise<Project> {
    const { data, error } = await this.supabase
      .from('projects')
      .insert(project)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateProject(projectId: string, updates: ProjectUpdate): Promise<Project> {
    const { data, error } = await this.supabase
      .from('projects')
      .update(updates)
      .eq('id', projectId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteProject(projectId: string): Promise<void> {
    const { error } = await this.supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (error) throw error;
  }
}
