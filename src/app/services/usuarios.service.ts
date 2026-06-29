import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { AppRole, Profile } from '../models/database.models';

@Injectable({
  providedIn: 'root',
})
export class UsuariosService {
  constructor(private supabaseService: SupabaseService) {}

  private get supabase() {
    return this.supabaseService.supabase;
  }

  async getAll(): Promise<Profile[]> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .order('nombre', { ascending: true });

    if (error) {
      console.error('Error al cargar usuarios:', error.message);
      return [];
    }

    return data as Profile[];
  }

  async update(
    id: string,
    payload: {
      nombre?: string;
      rol?: AppRole;
      area?: string | null;
      activo?: boolean;
    }
  ) {
    const { data, error } = await this.supabase
      .from('profiles')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    return { data, error };
  }
}