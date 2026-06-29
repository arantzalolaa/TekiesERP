import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Cliente, Producto, Venta } from '../models/database.models';

export interface VentaDetalle {
  id: number;
  fecha: string;
  cliente: string;
  tipo_cliente: string;
  producto: string;
  sku: string;
  cantidad: number;
  precio_unitario: number;
  total: number;
  utilidad: number;
  estado: string;
  pagada: boolean;
  metodo_pago: string;
}

@Injectable({
  providedIn: 'root',
})
export class VentasService {
  constructor(private supabaseService: SupabaseService) {}

  private get supabase() {
    return this.supabaseService.supabase;
  }

  async getAll(): Promise<VentaDetalle[]> {
    const { data, error } = await this.supabase
      .from('v_ventas_detalle')
      .select('*')
      .order('fecha', { ascending: false });

    if (error) {
      console.error('Error al cargar ventas:', error.message);
      return [];
    }

    return data as VentaDetalle[];
  }

  async getById(id: number): Promise<Venta | null> {
    const { data, error } = await this.supabase
      .from('ventas')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error al cargar venta:', error.message);
      return null;
    }

    return data as Venta;
  }

  async getClientes(): Promise<Cliente[]> {
    const { data, error } = await this.supabase
      .from('clientes')
      .select('*')
      .eq('estatus', 'Activo')
      .order('nombre', { ascending: true });

    if (error) {
      console.error('Error al cargar clientes:', error.message);
      return [];
    }

    return data as Cliente[];
  }

  async getProductos(): Promise<Producto[]> {
    const { data, error } = await this.supabase
      .from('productos')
      .select('*')
      .eq('activo', true)
      .order('nombre', { ascending: true });

    if (error) {
      console.error('Error al cargar productos:', error.message);
      return [];
    }

    return data as Producto[];
  }

  async create(venta: Venta) {
    const { data, error } = await this.supabase
      .from('ventas')
      .insert(venta)
      .select()
      .single();

    return { data, error };
  }

  async update(id: number, venta: Partial<Venta>) {
    const { data, error } = await this.supabase
      .from('ventas')
      .update(venta)
      .eq('id', id)
      .select()
      .single();

    return { data, error };
  }

  async delete(id: number) {
    const { error } = await this.supabase
      .from('ventas')
      .delete()
      .eq('id', id);

    return { error };
  }
}
