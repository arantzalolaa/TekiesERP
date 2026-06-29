import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/register/register.page').then((m) => m.RegisterPage),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/dashboard/dashboard.page').then((m) => m.DashboardPage),
  },
  {
    path: 'inventario',
    canActivate: [authGuard, roleGuard],
    data: {
      roles: ['admin', 'gerente', 'inventario', 'compras'],
    },
    loadComponent: () =>
      import('./pages/inventario/inventario.page').then((m) => m.InventarioPage),
  },
  {
    path: 'productos',
    canActivate: [authGuard, roleGuard],
    data: {
      roles: ['admin', 'gerente', 'inventario', 'ventas'],
    },
    loadComponent: () =>
      import('./pages/productos/productos.page').then((m) => m.ProductosPage),
  },
  {
    path: 'ventas',
    canActivate: [authGuard, roleGuard],
    data: {
      roles: ['admin', 'gerente', 'ventas'],
    },
    loadComponent: () =>
      import('./pages/ventas/ventas.page').then((m) => m.VentasPage),
  },
  {
    path: 'compras',
    canActivate: [authGuard, roleGuard],
    data: {
      roles: ['admin', 'gerente', 'compras'],
    },
    loadComponent: () =>
      import('./pages/compras/compras.page').then((m) => m.ComprasPage),
  },
  {
    path: 'finanzas',
    canActivate: [authGuard, roleGuard],
    data: {
      roles: ['admin', 'gerente', 'finanzas'],
    },
    loadComponent: () =>
      import('./pages/finanzas/finanzas.page').then((m) => m.FinanzasPage),
  },
  {
    path: 'clientes',
    canActivate: [authGuard, roleGuard],
    data: {
      roles: ['admin', 'gerente', 'ventas', 'finanzas'],
    },
    loadComponent: () =>
      import('./pages/clientes/clientes.page').then((m) => m.ClientesPage),
  },
  {
    path: 'proveedores',
    canActivate: [authGuard, roleGuard],
    data: {
      roles: ['admin', 'gerente', 'compras', 'inventario'],
    },
    loadComponent: () =>
      import('./pages/proveedores/proveedores.page').then(
        (m) => m.ProveedoresPage
      ),
  },
  {
    path: 'usuarios',
    canActivate: [authGuard, roleGuard],
    data: {
      roles: ['admin', 'gerente'],
    },
    loadComponent: () =>
      import('./pages/usuarios/usuarios.page').then((m) => m.UsuariosPage),
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];