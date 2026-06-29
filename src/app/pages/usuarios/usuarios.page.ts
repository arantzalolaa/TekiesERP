import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  IonContent,
  IonIcon,
  IonButton,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonToggle,
  IonSpinner,
  IonToast, IonHeader, IonToolbar } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  closeOutline,
  createOutline,
  peopleOutline,
  saveOutline,
  searchOutline,
} from 'ionicons/icons';
import { UsuariosService } from '../../services/usuarios.service';
import { AppRole, Profile } from '../../models/database.models';
import { ROLE_LABELS } from '../../shared/utils/roles';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.page.html',
  styleUrls: ['./usuarios.page.scss'],
  standalone: true,
  imports: [IonToolbar, IonHeader, 
    CommonModule,
    FormsModule,
    RouterModule,
    IonContent,
    IonIcon,
    IonButton,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonToggle,
    IonSpinner,
    IonToast,
  ],
})
export class UsuariosPage implements OnInit {
  usuarios: Profile[] = [];
  filteredUsuarios: Profile[] = [];

  roles: AppRole[] = [
    'admin',
    'gerente',
    'ventas',
    'compras',
    'inventario',
    'finanzas',
    'consulta',
  ];

  loading = true;
  saving = false;
  showForm = false;
  editingId: string | null = null;
  search = '';

  toastOpen = false;
  toastMessage = '';

  form = {
    nombre: '',
    correo: '',
    rol: 'consulta' as AppRole,
    area: '',
    activo: true,
  };

  constructor(private usuariosService: UsuariosService) {
    addIcons({
      arrowBackOutline,
      closeOutline,
      createOutline,
      peopleOutline,
      saveOutline,
      searchOutline,
    });
  }

  async ngOnInit() {
    await this.loadUsuarios();
  }

  async loadUsuarios() {
    this.loading = true;
    this.usuarios = await this.usuariosService.getAll();
    this.applyFilter();
    this.loading = false;
  }

  applyFilter() {
    const text = this.search.toLowerCase().trim();

    if (!text) {
      this.filteredUsuarios = [...this.usuarios];
      return;
    }

    this.filteredUsuarios = this.usuarios.filter((usuario) =>
      [
        usuario.nombre,
        usuario.correo,
        usuario.rol,
        usuario.area || '',
        usuario.activo ? 'activo' : 'inactivo',
      ]
        .join(' ')
        .toLowerCase()
        .includes(text)
    );
  }

  openEdit(usuario: Profile) {
    this.editingId = usuario.id;
    this.form = {
      nombre: usuario.nombre,
      correo: usuario.correo,
      rol: usuario.rol,
      area: usuario.area || '',
      activo: usuario.activo,
    };
    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
    this.editingId = null;
    this.form = {
      nombre: '',
      correo: '',
      rol: 'consulta',
      area: '',
      activo: true,
    };
  }

  async save() {
    if (!this.editingId) return;

    if (!this.form.nombre || !this.form.rol) {
      this.showToast('Completa nombre y rol.');
      return;
    }

    this.saving = true;

    const { error } = await this.usuariosService.update(this.editingId, {
      nombre: this.form.nombre.trim(),
      rol: this.form.rol,
      area: this.form.area?.trim() || null,
      activo: !!this.form.activo,
    });

    this.saving = false;

    if (error) {
      this.showToast(error.message);
      return;
    }

    this.showToast('Usuario actualizado.');
    this.closeForm();
    await this.loadUsuarios();
  }

  getRoleLabel(role: AppRole): string {
    return ROLE_LABELS[role];
  }

  showToast(message: string) {
    this.toastMessage = message;
    this.toastOpen = true;
  }
}