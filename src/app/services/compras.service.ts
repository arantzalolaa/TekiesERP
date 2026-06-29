import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Compra, Inventario, Proveedor } from '../models/database.models';

export interface CompraDetalle {
  id: number;
  fecha: string;
  proveedor: string;
  componente: string;
  sku: string;
  cantidad: number;
  costo_unitario: number;
  total: number;
  estado: string;
  metodo_pago: string;
}

@Injectable({
  providedIn: 'root',
})
export class ComprasService {
  constructor(private supabaseService: SupabaseService) {}

  private get supabase() {
    return this.supabaseService.supabase;
  }

  async getAll(): Promise<CompraDetalle[]> {
    const { data, error } = await this.supabase
      .from('v_compras_detalle')
      .select('*')
      .order('fecha', { ascending: false });

    if (error) {
      console.error('Error al cargar compras:', error.message);
      return [];
    }

    return data as CompraDetalle[];
  }

  async getById(id: number): Promise<Compra | null> {
    const { data, error } = await this.supabase
      .from('compras')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error al cargar compra:', error.message);
      return null;
    }

    return data as Compra;
  }

  async getProveedores(): Promise<Proveedor[]> {
    const { data, error } = await this.supabase
      .from('proveedores')
      .select('*')
      .eq('estado', 'Activo')
      .order('nombre', { ascending: true });

    if (error) {
      console.error('Error al cargar proveedores:', error.message);
      return [];
    }

    return data as Proveedor[];
  }

  async getInventario(): Promise<Inventario[]> {
    const { data, error } = await this.supabase
      .from('inventario')
      .select('*')
      .eq('activo', true)
      .order('nombre', { ascending: true });

    if (error) {
      console.error('Error al cargar inventario:', error.message);
      return [];
    }

    return data as Inventario[];
  }

  async create(compra: Compra) {
    const { data, error } = await this.supabase
      .from('compras')
      .insert(compra)
      .select()
      .single();

    return { data, error };
  }

  async update(id: number, compra: Partial<Compra>) {
    const { data, error } = await this.supabase
      .from('compras')
      .update(compra)
      .eq('id', id)
      .select()
      .single();

    return { data, error };
  }

  async delete(id: number) {
    const { error } = await this.supabase
      .from('compras')
      .delete()
      .eq('id', id);

    return { error };
  }
}
