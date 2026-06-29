import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from './supabase.service';
import { AppRole, Profile } from '../models/database.models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) {}

  private get supabase() {
    return this.supabaseService.supabase;
  }

  async signIn(email: string, password: string) {
    return await this.supabase.auth.signInWithPassword({
      email,
      password,
    });
  }

  async signUp(nombre: string, email: string, password: string) {
    return await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nombre,
          rol: 'consulta',
          area: 'Sin asignar',
        },
      },
    });
  }

  async signOut() {
    await this.supabase.auth.signOut();
    await this.router.navigateByUrl('/login', { replaceUrl: true });
  }

  async getSession() {
    const { data, error } = await this.supabase.auth.getSession();

    if (error) {
      console.error('Error al obtener sesión:', error.message);
      return null;
    }

    return data.session;
  }

  async getUser() {
    const { data, error } = await this.supabase.auth.getUser();

    if (error) {
      console.error('Error al obtener usuario:', error.message);
      return null;
    }

    return data.user;
  }

  async getProfile(): Promise<Profile | null> {
    const user = await this.getUser();

    if (!user) return null;

    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error al obtener perfil:', error.message);
      return null;
    }

    return data as Profile;
  }

  async getRole(): Promise<AppRole | null> {
    const profile = await this.getProfile();
    return profile?.rol ?? null;
  }

  async isLoggedIn(): Promise<boolean> {
    const session = await this.getSession();
    return !!session;
  }
}