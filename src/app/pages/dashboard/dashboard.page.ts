import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import {
  IonContent,
  IonIcon,
  IonButton,
  IonSpinner,
  IonRefresher,
  IonRefresherContent, IonHeader, IonToolbar } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  analyticsOutline,
  bagHandleOutline,
  businessOutline,
  cardOutline,
  cashOutline,
  cubeOutline,
  logOutOutline,
  peopleOutline,
  pricetagOutline,
  refreshOutline,
  trendingUpOutline,
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

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [IonToolbar, IonHeader, 
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
      bagHandleOutline,
      businessOutline,
      cardOutline,
      cashOutline,
      cubeOutline,
      logOutOutline,
      peopleOutline,
      pricetagOutline,
      refreshOutline,
      trendingUpOutline,
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

  formatCurrency(value: number | null | undefined): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      maximumFractionDigits: 0,
    }).format(value ?? 0);
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