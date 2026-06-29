export type AppRole =
  | 'admin'
  | 'gerente'
  | 'ventas'
  | 'compras'
  | 'inventario'
  | 'finanzas'
  | 'consulta';

export type EstadoGeneral = 'pendiente' | 'completada' | 'cancelada';

export type TipoMovimiento = 'ingreso' | 'gasto';

export type TipoItemInventario =
  | 'componente'
  | 'material'
  | 'empaque'
  | 'servicio';

export type TipoCliente = 'final' | 'distribuidor' | 'empresa';

export interface Profile {
  id: string;
  nombre: string;
  correo: string;
  rol: AppRole;
  area: string | null;
  activo: boolean;
  created_at: string;
}

export interface Proveedor {
  id?: number;
  nombre: string;
  contacto?: string | null;
  telefono?: string | null;
  correo?: string | null;
  sitio_web?: string | null;
  tipo_suministro: string;
  pais?: string | null;
  estado?: string;
  created_at?: string;
}

export interface Cliente {
  id?: number;
  nombre: string;
  tipo: TipoCliente;
  correo?: string | null;
  telefono?: string | null;
  ciudad?: string | null;
  estado_republica?: string | null;
  limite_credito: number;
  saldo_pendiente: number;
  estatus?: string;
  created_at?: string;
}

export interface Inventario {
  id?: number;
  nombre: string;
  tipo: TipoItemInventario;
  categoria: string;
  sku: string;
  descripcion?: string | null;
  unidad: string;
  stock: number;
  stock_minimo: number;
  costo_unitario: number;
  proveedor_id?: number | null;
  activo?: boolean;
  created_at?: string;
}

export interface Producto {
  id?: number;
  nombre: string;
  sku: string;
  descripcion?: string | null;
  categoria: string;
  stock: number;
  stock_minimo: number;
  costo_estimado: number;
  precio_venta: number;
  activo?: boolean;
  created_at?: string;
}

export interface Compra {
  id?: number;
  proveedor_id: number;
  inventario_id: number;
  fecha: string;
  cantidad: number;
  costo_unitario: number;
  total?: number;
  estado: EstadoGeneral;
  metodo_pago?: string | null;
  notas?: string | null;
  procesada?: boolean;
  created_at?: string;
}

export interface Venta {
  id?: number;
  cliente_id: number;
  producto_id: number;
  fecha: string;
  cantidad: number;
  precio_unitario: number;
  costo_unitario?: number;
  total?: number;
  utilidad?: number;
  estado: EstadoGeneral;
  pagada: boolean;
  metodo_pago?: string | null;
  notas?: string | null;
  procesada?: boolean;
  created_at?: string;
}

export interface Finanzas {
  id?: number;
  fecha: string;
  tipo: TipoMovimiento;
  concepto: string;
  monto: number;
  modulo_origen?: string | null;
  referencia_id?: number | null;
  pagado: boolean;
  notas?: string | null;
  created_at?: string;
}

export interface DashboardResumen {
  ventas_totales: number;
  utilidad_total: number;
  ingresos: number;
  gastos: number;
  flujo_neto: number;
  total_ventas: number;
  total_compras: number;
  total_clientes: number;
  total_proveedores: number;
  productos_stock_bajo: number;
  componentes_stock_bajo: number;
}

export interface StockBajo {
  origen: 'producto' | 'inventario';
  id: number;
  nombre: string;
  sku: string;
  stock: number;
  stock_minimo: number;
  proveedor: string | null;
}