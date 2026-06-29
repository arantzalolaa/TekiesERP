import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Finanzas } from '../models/database.models';

@Injectable({
  providedIn: 'root',
})
export class FinanzasService {
  constructor(private supabaseService: SupabaseService) {}

  private get supabase() {
    return this.supabaseService.supabase;
  }

  async getAll(): Promise<Finanzas[]> {
    const { data, error } = await this.supabase
      .from('finanzas')
      .select('*')
      .order('fecha', { ascending: false });

    if (error) {
      console.error('Error al cargar finanzas:', error.message);
      return [];
    }

    return data as Finanzas[];
  }

  async create(movimiento: Finanzas) {
    const { data, error } = await this.supabase
      .from('finanzas')
      .insert(movimiento)
      .select()
      .single();

    return { data, error };
  }

  async update(id: number, movimiento: Partial<Finanzas>) {
    const { data, error } = await this.supabase
      .from('finanzas')
      .update(movimiento)
      .eq('id', id)
      .select()
      .single();

    return { data, error };
  }

  async delete(id: number) {
    const { error } = await this.supabase
      .from('finanzas')
      .delete()
      .eq('id', id);

    return { error };
  }
}