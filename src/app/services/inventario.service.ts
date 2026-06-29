import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Inventario, Proveedor } from '../models/database.models';

@Injectable({
  providedIn: 'root',
})
export class InventarioService {
  constructor(private supabaseService: SupabaseService) {}

  private get supabase() {
    return this.supabaseService.supabase;
  }

  async getAll(): Promise<Inventario[]> {
    const { data, error } = await this.supabase
      .from('inventario')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.error('Error al cargar inventario:', error.message);
      return [];
    }

    return data as Inventario[];
  }

  async getProveedores(): Promise<Proveedor[]> {
    const { data, error } = await this.supabase
      .from('proveedores')
      .select('*')
      .order('nombre', { ascending: true });

    if (error) {
      console.error('Error al cargar proveedores:', error.message);
      return [];
    }

    return data as Proveedor[];
  }

  async create(item: Inventario) {
    const { data, error } = await this.supabase
      .from('inventario')
      .insert(item)
      .select()
      .single();

    return { data, error };
  }

  async update(id: number, item: Partial<Inventario>) {
    const { data, error } = await this.supabase
      .from('inventario')
      .update(item)
      .eq('id', id)
      .select()
      .single();

    return { data, error };
  }

  async delete(id: number) {
    const { error } = await this.supabase
      .from('inventario')
      .delete()
      .eq('id', id);

    return { error };
  }
}