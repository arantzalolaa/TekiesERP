import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import {
  IonContent,
  IonIcon,
  IonButton,
  IonSpinner,
  IonRefresher,
  IonRefresherContent,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  analyticsOutline,
  alertCircleOutline,
  bagHandleOutline,
  barChartOutline,
  businessOutline,
  cardOutline,
  cashOutline,
  checkmarkCircleOutline,
  cubeOutline,
  logOutOutline,
  peopleOutline,
  pricetagOutline,
  pulseOutline,
  refreshOutline,
  statsChartOutline,
  trendingUpOutline,
  walletOutline,
  warningOutline,
} from 'ionicons/icons';
import { DashboardService } from '../../services/dashboard.service';
import { AuthService } from '../../services/auth.service';
import { DashboardResumen, Profile, StockBajo } from '../../models/database.models';
import { ROLE_LABELS } from '../../shared/utils/roles';

interface ModuleCard {
  title: string;
  subtitle: string;
  route: string;
  icon: string;
}

interface ChartBar {
  label: string;
  value: number;
  width: number;
  className: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonContent,
    IonIcon,
    IonButton,
    IonSpinner,
    IonRefresher,
    IonRefresherContent,
  ],
})
export class DashboardPage implements OnInit {
  resumen: DashboardResumen | null = null;
  stockBajo: StockBajo[] = [];
  profile: Profile | null = null;

  loading = true;

  modules: ModuleCard[] = [
    {
      title: 'Inventario',
      subtitle: 'Componentes y materiales',
      route: '/inventario',
      icon: 'cube-outline',
    },
    {
      title: 'Productos',
      subtitle: 'Pulseras HeliBand',
      route: '/productos',
      icon: 'pricetag-outline',
    },
    {
      title: 'Ventas',
      subtitle: 'Pedidos e ingresos',
      route: '/ventas',
      icon: 'bag-handle-outline',
    },
    {
      title: 'Compras',
      subtitle: 'Proveedores y costos',
      route: '/compras',
      icon: 'business-outline',
    },
    {
      title: 'Finanzas',
      subtitle: 'Flujo y utilidad',
      route: '/finanzas',
      icon: 'cash-outline',
    },
    {
      title: 'Clientes',
      subtitle: 'Cartera comercial',
      route: '/clientes',
      icon: 'people-outline',
    },
  ];

  constructor(
    private dashboardService: DashboardService,
    private authService: AuthService,
    private router: Router
  ) {
    addIcons({
      analyticsOutline,
      alertCircleOutline,
      bagHandleOutline,
      barChartOutline,
      businessOutline,
      cardOutline,
      cashOutline,
      checkmarkCircleOutline,
      cubeOutline,
      logOutOutline,
      peopleOutline,
      pricetagOutline,
      pulseOutline,
      refreshOutline,
      statsChartOutline,
      trendingUpOutline,
      walletOutline,
      warningOutline,
    });
  }

  async ngOnInit() {
    await this.loadData();
  }

  async loadData(event?: CustomEvent) {
    this.loading = !event;

    const [profile, resumen, stockBajo] = await Promise.all([
      this.authService.getProfile(),
      this.dashboardService.getResumen(),
      this.dashboardService.getStockBajo(),
    ]);

    this.profile = profile;
    this.resumen = resumen;
    this.stockBajo = stockBajo;
    this.loading = false;

    if (event) {
      event.detail.complete();
    }
  }

  get ingresos(): number {
    return this.resumen?.ingresos ?? 0;
  }

  get gastos(): number {
    return this.resumen?.gastos ?? 0;
  }

  get utilidad(): number {
    return this.resumen?.utilidad_total ?? 0;
  }

  get ventasTotales(): number {
    return this.resumen?.ventas_totales ?? 0;
  }

  get flujoNeto(): number {
    return this.resumen?.flujo_neto ?? 0;
  }

  get stockAlertas(): number {
    return (this.resumen?.productos_stock_bajo || 0) + (this.resumen?.componentes_stock_bajo || 0);
  }

  get margenPorcentaje(): number {
    if (this.ventasTotales <= 0) return 0;
    return Math.round((this.utilidad / this.ventasTotales) * 100);
  }

  get gastosPorcentaje(): number {
    if (this.ingresos <= 0) return 0;
    return Math.min(100, Math.round((this.gastos / this.ingresos) * 100));
  }

  get utilidadPorcentaje(): number {
    if (this.ingresos <= 0) return 0;
    return Math.max(0, Math.min(100, Math.round((this.utilidad / this.ingresos) * 100)));
  }

  get financeSignalClass(): string {
    if (this.flujoNeto > 0 && this.margenPorcentaje >= 20) return 'healthy';
    if (this.flujoNeto >= 0) return 'neutral';
    return 'risk';
  }

  get financeSignalIcon(): string {
    if (this.financeSignalClass === 'healthy') return 'checkmark-circle-outline';
    if (this.financeSignalClass === 'neutral') return 'alert-circle-outline';
    return 'warning-outline';
  }

  get financeSignalTitle(): string {
    if (this.financeSignalClass === 'healthy') return 'Operación rentable';
    if (this.financeSignalClass === 'neutral') return 'Operación estable';
    return 'Revisar gastos';
  }

  get financeSignalText(): string {
    if (this.financeSignalClass === 'healthy') {
      return `El margen estimado es de ${this.margenPorcentaje}%, con flujo positivo.`;
    }

    if (this.financeSignalClass === 'neutral') {
      return `El flujo está positivo, pero el margen puede mejorar.`;
    }

    return 'Los gastos superan los ingresos registrados. Conviene revisar compras, pagos pendientes y costos.';
  }

  getDonutStyle(): string {
    const gasto = this.gastosPorcentaje;
    return `conic-gradient(#e8a3a8 0 ${gasto}%, #7fd3b2 ${gasto}% 100%)`;
  }

  getFinanceBars(): ChartBar[] {
    const values = [this.ingresos, this.gastos, this.utilidad].map((value) => Math.max(0, value));
    const max = Math.max(...values, 1);

    return [
      {
        label: 'Ingresos',
        value: this.ingresos,
        width: Math.max(8, Math.round((Math.max(0, this.ingresos) / max) * 100)),
        className: 'bar-fill income',
      },
      {
        label: 'Gastos',
        value: this.gastos,
        width: Math.max(8, Math.round((Math.max(0, this.gastos) / max) * 100)),
        className: 'bar-fill expense',
      },
      {
        label: 'Utilidad',
        value: this.utilidad,
        width: Math.max(8, Math.round((Math.max(0, this.utilidad) / max) * 100)),
        className: 'bar-fill profit',
      },
    ];
  }

  formatCurrency(value: number | null | undefined): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      maximumFractionDigits: 0,
    }).format(value ?? 0);
  }

  formatPercent(value: number): string {
    return `${value}%`;
  }

  getRoleLabel(): string {
    if (!this.profile?.rol) return 'Sin rol';
    return ROLE_LABELS[this.profile.rol];
  }

  async logout() {
    await this.authService.signOut();
  }

  goTo(route: string) {
    this.router.navigateByUrl(route);
  }
}
