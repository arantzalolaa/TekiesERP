import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { DashboardResumen, StockBajo } from '../models/database.models';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  constructor(private supabaseService: SupabaseService) {}

  private get supabase() {
    return this.supabaseService.supabase;
  }

  async getResumen(): Promise<DashboardResumen | null> {
    const { data, error } = await this.supabase
      .from('v_dashboard_resumen')
      .select('*')
      .single();

    if (error) {
      console.error('Error al cargar dashboard:', error.message);
      return null;
    }

    return data as DashboardResumen;
  }

  async getStockBajo(): Promise<StockBajo[]> {
    const { data, error } = await this.supabase
      .from('v_stock_bajo')
      .select('*')
      .order('stock', { ascending: true })
      .limit(6);

    if (error) {
      console.error('Error al cargar stock bajo:', error.message);
      return [];
    }

    return data as StockBajo[];
  }
}