import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import {
  IonApp,
  IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  analyticsOutline,
  bagHandleOutline,
  businessOutline,
  cashOutline,
  chevronBackOutline,
  cubeOutline,
  gridOutline,
  logOutOutline,
  menuOutline,
  peopleOutline,
  pricetagOutline,
  shieldCheckmarkOutline,
} from 'ionicons/icons';
import { filter } from 'rxjs';
import { AuthService } from './services/auth.service';
import { AppRole, Profile } from './models/database.models';
import { canAccess, ROLE_LABELS } from './shared/utils/roles';

interface MenuItem {
  title: string;
  route: string;
  icon: string;
  roles?: AppRole[];
}

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonApp,
    IonIcon,
  ],
})
export class AppComponent implements OnInit {
  profile: Profile | null = null;
  showMenu = false;
  sidebarClosed = false;

  menuItems: MenuItem[] = [
    {
      title: 'Dashboard',
      route: '/dashboard',
      icon: 'grid-outline',
    },
    {
      title: 'Inventario',
      route: '/inventario',
      icon: 'cube-outline',
      roles: ['admin', 'gerente', 'inventario', 'compras'],
    },
    {
      title: 'Productos',
      route: '/productos',
      icon: 'pricetag-outline',
      roles: ['admin', 'gerente', 'inventario', 'ventas'],
    },
    {
      title: 'Ventas',
      route: '/ventas',
      icon: 'bag-handle-outline',
      roles: ['admin', 'gerente', 'ventas'],
    },
    {
      title: 'Compras',
      route: '/compras',
      icon: 'business-outline',
      roles: ['admin', 'gerente', 'compras'],
    },
    {
      title: 'Finanzas',
      route: '/finanzas',
      icon: 'cash-outline',
      roles: ['admin', 'gerente', 'finanzas'],
    },
    {
      title: 'Clientes',
      route: '/clientes',
      icon: 'people-outline',
      roles: ['admin', 'gerente', 'ventas', 'finanzas'],
    },
    {
      title: 'Proveedores',
      route: '/proveedores',
      icon: 'analytics-outline',
      roles: ['admin', 'gerente', 'compras', 'inventario'],
    },
    {
      title: 'Usuarios',
      route: '/usuarios',
      icon: 'shield-checkmark-outline',
      roles: ['admin', 'gerente'],
    },
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    addIcons({
      analyticsOutline,
      bagHandleOutline,
      businessOutline,
      cashOutline,
      chevronBackOutline,
      cubeOutline,
      gridOutline,
      logOutOutline,
      menuOutline,
      peopleOutline,
      pricetagOutline,
      shieldCheckmarkOutline,
    });
  }

  async ngOnInit() {
    const savedState = localStorage.getItem('tekies_sidebar_closed');
    this.sidebarClosed = savedState === 'true';

    await this.refreshShell();

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(async () => {
        await this.refreshShell();
      });
  }

  async refreshShell() {
    const currentUrl = this.router.url;
    const isAuthPage =
      currentUrl.includes('/login') || currentUrl.includes('/register');

    if (isAuthPage) {
      this.showMenu = false;
      this.profile = null;
      return;
    }

    const session = await this.authService.getSession();

    if (!session) {
      this.showMenu = false;
      this.profile = null;
      return;
    }

    this.profile = await this.authService.getProfile();
    this.showMenu = true;
  }

  toggleSidebar() {
    this.sidebarClosed = !this.sidebarClosed;
    localStorage.setItem('tekies_sidebar_closed', String(this.sidebarClosed));
  }

  canShowItem(item: MenuItem): boolean {
    if (!item.roles || item.roles.length === 0) return true;
    return canAccess(this.profile?.rol ?? null, item.roles);
  }

  getRoleLabel(): string {
    if (!this.profile?.rol) return 'Sin rol';
    return ROLE_LABELS[this.profile.rol];
  }

  async logout() {
    await this.authService.signOut();
    this.profile = null;
    this.showMenu = false;
  }
}
