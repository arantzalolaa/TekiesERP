import { AppRole } from '../../models/database.models';

export const ROLE_LABELS: Record<AppRole, string> = {
  admin: 'Administradora',
  gerente: 'Gerencia',
  ventas: 'Ventas',
  compras: 'Compras',
  inventario: 'Inventario',
  finanzas: 'Finanzas',
  consulta: 'Consulta',
};

export const ROLE_HOME: Record<AppRole, string> = {
  admin: '/dashboard',
  gerente: '/dashboard',
  ventas: '/ventas',
  compras: '/compras',
  inventario: '/inventario',
  finanzas: '/finanzas',
  consulta: '/dashboard',
};

export function canAccess(role: AppRole | null, allowedRoles?: AppRole[]): boolean {
  if (!role) return false;
  if (!allowedRoles || allowedRoles.length === 0) return true;
  return allowedRoles.includes(role);
}