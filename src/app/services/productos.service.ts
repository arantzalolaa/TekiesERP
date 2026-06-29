import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Producto } from '../models/database.models';

@Injectable({
  providedIn: 'root',
})
export class ProductosService {
  constructor(private supabaseService: SupabaseService) {}

  private get supabase() {
    return this.supabaseService.supabase;
  }

  async getAll(): Promise<Producto[]> {
    const { data, error } = await this.supabase
      .from('productos')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.error('Error al cargar productos:', error.message);
      return [];
    }

    return data as Producto[];
  }

  async create(producto: Producto) {
    const { data, error } = await this.supabase
      .from('productos')
      .insert(producto)
      .select()
      .single();

    return { data, error };
  }

  async update(id: number, producto: Partial<Producto>) {
    const { data, error } = await this.supabase
      .from('productos')
      .update(producto)
      .eq('id', id)
      .select()
      .single();

    return { data, error };
  }

  async delete(id: number) {
    const { error } = await this.supabase
      .from('productos')
      .delete()
      .eq('id', id);

    return { error };
  }
}