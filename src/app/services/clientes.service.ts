import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Cliente } from '../models/database.models';

@Injectable({
  providedIn: 'root',
})
export class ClientesService {
  constructor(private supabaseService: SupabaseService) {}

  private get supabase() {
    return this.supabaseService.supabase;
  }

  async getAll(): Promise<Cliente[]> {
    const { data, error } = await this.supabase
      .from('clientes')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.error('Error al cargar clientes:', error.message);
      return [];
    }

    return data as Cliente[];
  }

  async create(cliente: Cliente) {
    const { data, error } = await this.supabase
      .from('clientes')
      .insert(cliente)
      .select()
      .single();

    return { data, error };
  }

  async update(id: number, cliente: Partial<Cliente>) {
    const { data, error } = await this.supabase
      .from('clientes')
      .update(cliente)
      .eq('id', id)
      .select()
      .single();

    return { data, error };
  }

  async delete(id: number) {
    const { error } = await this.supabase
      .from('clientes')
      .delete()
      .eq('id', id);

    return { error };
  }
}