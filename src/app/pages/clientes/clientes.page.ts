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
  IonSpinner,
  IonToast, IonHeader, IonToolbar } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline,
  arrowBackOutline,
  closeOutline,
  createOutline,
  peopleOutline,
  saveOutline,
  searchOutline,
  trashOutline,
} from 'ionicons/icons';
import { ClientesService } from '../../services/clientes.service';
import { Cliente, TipoCliente } from '../../models/database.models';

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.page.html',
  styleUrls: ['./clientes.page.scss'],
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
    IonSpinner,
    IonToast,
  ],
})
export class ClientesPage implements OnInit {
  clientes: Cliente[] = [];
  filteredClientes: Cliente[] = [];

  tipos: TipoCliente[] = ['final', 'distribuidor', 'empresa'];
  estatusOptions = ['Activo', 'Inactivo', 'Suspendido'];

  loading = true;
  saving = false;
  showForm = false;
  editingId: number | null = null;
  search = '';

  toastOpen = false;
  toastMessage = '';

  form: Cliente = this.getEmptyForm();

  constructor(private clientesService: ClientesService) {
    addIcons({
      addOutline,
      arrowBackOutline,
      closeOutline,
      createOutline,
      peopleOutline,
      saveOutline,
      searchOutline,
      trashOutline,
    });
  }

  async ngOnInit() {
    await this.loadClientes();
  }

  getEmptyForm(): Cliente {
    return {
      nombre: '',
      tipo: 'final',
      correo: '',
      telefono: '',
      ciudad: '',
      estado_republica: '',
      limite_credito: null as any,
      saldo_pendiente: null as any,
      estatus: 'Activo',
    };
  }

  async loadClientes() {
    this.loading = true;
    this.clientes = await this.clientesService.getAll();
    this.applyFilter();
    this.loading = false;
  }

  applyFilter() {
    const text = this.search.toLowerCase().trim();

    if (!text) {
      this.filteredClientes = [...this.clientes];
      return;
    }

    this.filteredClientes = this.clientes.filter((cliente) =>
      [
        cliente.nombre,
        cliente.tipo,
        cliente.correo || '',
        cliente.telefono || '',
        cliente.ciudad || '',
        cliente.estado_republica || '',
        cliente.estatus || '',
      ]
        .join(' ')
        .toLowerCase()
        .includes(text)
    );
  }

  openCreate() {
    this.form = this.getEmptyForm();
    this.editingId = null;
    this.showForm = true;
  }

  openEdit(cliente: Cliente) {
    this.form = { ...cliente };
    this.editingId = cliente.id ?? null;
    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
    this.editingId = null;
    this.form = this.getEmptyForm();
  }

  async save() {
    if (!this.form.nombre || !this.form.tipo) {
      this.showToast('Completa el nombre y tipo de cliente.');
      return;
    }

    const payload: Cliente = {
      nombre: this.form.nombre.trim(),
      tipo: this.form.tipo,
      correo: this.form.correo?.trim() || null,
      telefono: this.form.telefono?.trim() || null,
      ciudad: this.form.ciudad?.trim() || null,
      estado_republica: this.form.estado_republica?.trim() || null,
      limite_credito: Number(this.form.limite_credito) || 0,
      saldo_pendiente: Number(this.form.saldo_pendiente) || 0,
      estatus: this.form.estatus || 'Activo',
    };

    if (payload.tipo === 'distribuidor' && payload.limite_credito === 0) {
      payload.limite_credito = 20000;
    }

    this.saving = true;

    const result = this.editingId
      ? await this.clientesService.update(this.editingId, payload)
      : await this.clientesService.create(payload);

    this.saving = false;

    if (result.error) {
      this.showToast(result.error.message);
      return;
    }

    this.showToast(this.editingId ? 'Cliente actualizado.' : 'Cliente creado.');
    this.closeForm();
    await this.loadClientes();
  }

  async delete(cliente: Cliente) {
    if (!cliente.id) return;

    const confirmDelete = confirm(`¿Eliminar ${cliente.nombre}?`);

    if (!confirmDelete) return;

    const { error } = await this.clientesService.delete(cliente.id);

    if (error) {
      this.showToast(error.message);
      return;
    }

    this.showToast('Cliente eliminado.');
    await this.loadClientes();
  }

  formatTipo(value: string): string {
    if (!value) return '—';
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
  }

  formatCurrency(value: number | undefined): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      maximumFractionDigits: 0,
    }).format(value ?? 0);
  }

  showToast(message: string) {
    this.toastMessage = message;
    this.toastOpen = true;
  }
}
