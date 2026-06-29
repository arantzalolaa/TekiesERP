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
  IonTextarea,
  IonSpinner,
  IonToast, IonHeader, IonToolbar } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline,
  arrowBackOutline,
  closeOutline,
  createOutline,
  saveOutline,
  searchOutline,
  trashOutline,
} from 'ionicons/icons';
import { ComprasService, CompraDetalle } from '../../services/compras.service';
import { Compra, Inventario, Proveedor } from '../../models/database.models';

@Component({
  selector: 'app-compras',
  templateUrl: './compras.page.html',
  styleUrls: ['./compras.page.scss'],
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
    IonTextarea,
    IonSpinner,
    IonToast,
  ],
})
export class ComprasPage implements OnInit {
  compras: CompraDetalle[] = [];
  filteredCompras: CompraDetalle[] = [];
  proveedores: Proveedor[] = [];
  inventario: Inventario[] = [];

  estados = [
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'completada', label: 'Completada' },
    { value: 'cancelada', label: 'Cancelada' },
  ];

  metodosPago = ['Transferencia', 'Tarjeta', 'Efectivo', 'Credito proveedor'];

  loading = true;
  saving = false;
  showForm = false;
  editingId: number | null = null;
  search = '';

  toastOpen = false;
  toastMessage = '';

  form: Compra = this.getEmptyForm();

  constructor(private comprasService: ComprasService) {
    addIcons({
      addOutline,
      arrowBackOutline,
      closeOutline,
      createOutline,
      saveOutline,
      searchOutline,
      trashOutline,
    });
  }

  async ngOnInit() {
    await this.loadData();
  }

  getEmptyForm(): Compra {
    return {
      proveedor_id: 0,
      inventario_id: 0,
      fecha: new Date().toISOString().slice(0, 10),
      cantidad: null as any,
      costo_unitario: null as any,
      estado: 'completada',
      metodo_pago: 'Transferencia',
      notas: '',
    };
  }

  async loadData() {
    this.loading = true;
    const [compras, proveedores, inventario] = await Promise.all([
      this.comprasService.getAll(),
      this.comprasService.getProveedores(),
      this.comprasService.getInventario(),
    ]);
    this.compras = compras;
    this.proveedores = proveedores;
    this.inventario = inventario;
    this.applyFilter();
    this.loading = false;
  }

  applyFilter() {
    const text = this.search.toLowerCase().trim();
    if (!text) {
      this.filteredCompras = [...this.compras];
      return;
    }
    this.filteredCompras = this.compras.filter((compra) =>
      [compra.proveedor, compra.componente, compra.sku, compra.estado, compra.metodo_pago || '']
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

  async openEdit(compra: CompraDetalle) {
    const data = await this.comprasService.getById(compra.id);
    if (!data) {
      this.showToast('No se pudo cargar la compra.');
      return;
    }
    this.form = { ...data };
    this.editingId = compra.id;
    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
    this.editingId = null;
    this.form = this.getEmptyForm();
  }

  onInventarioChange() {
    const item = this.inventario.find((inv) => inv.id === Number(this.form.inventario_id));
    if (!item) return;
    this.form.costo_unitario = item.costo_unitario;
    if (item.proveedor_id) this.form.proveedor_id = item.proveedor_id;
  }

  getTotalPreview(): number {
    return (Number(this.form.cantidad) || 0) * (Number(this.form.costo_unitario) || 0);
  }

  async save() {
    if (!this.form.proveedor_id || !this.form.inventario_id) {
      this.showToast('Selecciona proveedor y componente.');
      return;
    }
    if (Number(this.form.cantidad) <= 0) {
      this.showToast('La cantidad debe ser mayor a cero.');
      return;
    }
    const payload: Compra = {
      proveedor_id: Number(this.form.proveedor_id),
      inventario_id: Number(this.form.inventario_id),
      fecha: this.form.fecha,
      cantidad: Number(this.form.cantidad),
      costo_unitario: Number(this.form.costo_unitario) || 0,
      estado: this.form.estado,
      metodo_pago: this.form.metodo_pago?.trim() || 'Transferencia',
      notas: this.form.notas?.trim() || null,
    };
    this.saving = true;
    const result = this.editingId
      ? await this.comprasService.update(this.editingId, payload)
      : await this.comprasService.create(payload);
    this.saving = false;
    if (result.error) {
      this.showToast(result.error.message);
      return;
    }
    this.showToast(this.editingId ? 'Compra actualizada.' : 'Compra registrada.');
    this.closeForm();
    await this.loadData();
  }

  async delete(compra: CompraDetalle) {
    const confirmDelete = confirm(`¿Eliminar compra #${compra.id}?`);
    if (!confirmDelete) return;
    const { error } = await this.comprasService.delete(compra.id);
    if (error) {
      this.showToast(error.message);
      return;
    }
    this.showToast('Compra eliminada.');
    await this.loadData();
  }

  getMetodoClass(metodo: string | null | undefined): string {
    const value = metodo?.toLowerCase() || '';
    if (value.includes('crédito') || value.includes('credito')) return 'credit';
    if (value.includes('transferencia')) return 'transfer';
    if (value.includes('efectivo')) return 'cash';
    return 'card';
  }

  formatEstado(value: string | null | undefined): string {
    return this.formatLabel(value || '');
  }

  formatLabel(value: string): string {
    if (!value) return '—';
    return value
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
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
