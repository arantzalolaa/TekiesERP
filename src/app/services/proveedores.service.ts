import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Proveedor } from '../models/database.models';

@Injectable({
  providedIn: 'root',
})
export class ProveedoresService {
  constructor(private supabaseService: SupabaseService) {}

  private get supabase() {
    return this.supabaseService.supabase;
  }

  async getAll(): Promise<Proveedor[]> {
    const { data, error } = await this.supabase
      .from('proveedores')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.error('Error al cargar proveedores:', error.message);
      return [];
    }

    return data as Proveedor[];
  }

  async create(proveedor: Proveedor) {
    const { data, error } = await this.supabase
      .from('proveedores')
      .insert(proveedor)
      .select()
      .single();

    return { data, error };
  }

  async update(id: number, proveedor: Partial<Proveedor>) {
    const { data, error } = await this.supabase
      .from('proveedores')
      .update(proveedor)
      .eq('id', id)
      .select()
      .single();

    return { data, error };
  }

  async delete(id: number) {
    const { error } = await this.supabase
      .from('proveedores')
      .delete()
      .eq('id', id);

    return { error };
  }
}