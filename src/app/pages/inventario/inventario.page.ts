import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  IonContent,
  IonIcon,
  IonButton,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonToggle,
  IonSpinner,
  IonToast, IonHeader, IonToolbar } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline,
  arrowBackOutline,
  closeOutline,
  createOutline,
  cubeOutline,
  saveOutline,
  searchOutline,
  trashOutline,
} from 'ionicons/icons';
import { InventarioService } from '../../services/inventario.service';
import {
  Inventario,
  Proveedor,
  TipoItemInventario,
} from '../../models/database.models';

@Component({
  selector: 'app-inventario',
  templateUrl: './inventario.page.html',
  styleUrls: ['./inventario.page.scss'],
  standalone: true,
  imports: [IonToolbar, IonHeader, 
    CommonModule,
    FormsModule,
    RouterModule,
    IonContent,
    IonIcon,
    IonButton,
    IonInput,
    IonTextarea,
    IonSelect,
    IonSelectOption,
    IonToggle,
    IonSpinner,
    IonToast,
  ],
})
export class InventarioPage implements OnInit {
  inventario: Inventario[] = [];
  filteredInventario: Inventario[] = [];
  proveedores: Proveedor[] = [];

  loading = true;
  saving = false;
  showForm = false;
  editingId: number | null = null;
  search = '';

  toastOpen = false;
  toastMessage = '';

  tipos: TipoItemInventario[] = ['componente', 'material', 'empaque', 'servicio'];

  form: Inventario = this.getEmptyForm();

  constructor(private inventarioService: InventarioService) {
    addIcons({
      addOutline,
      arrowBackOutline,
      closeOutline,
      createOutline,
      cubeOutline,
      saveOutline,
      searchOutline,
      trashOutline,
    });
  }

  async ngOnInit() {
    await this.loadData();
  }

  getEmptyForm(): Inventario {
    return {
      nombre: '',
      tipo: 'componente',
      categoria: '',
      sku: '',
      descripcion: '',
      unidad: 'pieza',
      stock: 0,
      stock_minimo: 20,
      costo_unitario: 0,
      proveedor_id: null,
      activo: true,
    };
  }

  async loadData() {
    this.loading = true;

    const [inventario, proveedores] = await Promise.all([
      this.inventarioService.getAll(),
      this.inventarioService.getProveedores(),
    ]);

    this.inventario = inventario;
    this.proveedores = proveedores;
    this.applyFilter();

    this.loading = false;
  }

  applyFilter() {
    const text = this.search.toLowerCase().trim();

    if (!text) {
      this.filteredInventario = [...this.inventario];
      return;
    }

    this.filteredInventario = this.inventario.filter((item) =>
      [
        item.nombre,
        item.sku,
        item.categoria,
        item.tipo,
        item.descripcion || '',
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

  openEdit(item: Inventario) {
    this.form = { ...item };
    this.editingId = item.id ?? null;
    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
    this.editingId = null;
    this.form = this.getEmptyForm();
  }

  async save() {
    if (!this.form.nombre || !this.form.sku || !this.form.categoria) {
      this.showToast('Completa nombre, SKU y categoría.');
      return;
    }

    this.saving = true;

    const payload: Inventario = {
      nombre: this.form.nombre.trim(),
      tipo: this.form.tipo,
      categoria: this.form.categoria.trim(),
      sku: this.form.sku.trim().toUpperCase(),
      descripcion: this.form.descripcion?.trim() || null,
      unidad: this.form.unidad.trim() || 'pieza',
      stock: Number(this.form.stock) || 0,
      stock_minimo: Number(this.form.stock_minimo) || 0,
      costo_unitario: Number(this.form.costo_unitario) || 0,
      proveedor_id: this.form.proveedor_id ? Number(this.form.proveedor_id) : null,
      activo: !!this.form.activo,
    };

    const result = this.editingId
      ? await this.inventarioService.update(this.editingId, payload)
      : await this.inventarioService.create(payload);

    this.saving = false;

    if (result.error) {
      this.showToast(result.error.message);
      return;
    }

    this.showToast(this.editingId ? 'Inventario actualizado.' : 'Componente creado.');
    this.closeForm();
    await this.loadData();
  }

  async delete(item: Inventario) {
    if (!item.id) return;

    const confirmDelete = confirm(`¿Eliminar ${item.nombre}?`);

    if (!confirmDelete) return;

    const { error } = await this.inventarioService.delete(item.id);

    if (error) {
      this.showToast(error.message);
      return;
    }

    this.showToast('Registro eliminado.');
    await this.loadData();
  }

  getProveedorName(id?: number | null): string {
    if (!id) return 'Sin proveedor';
    return this.proveedores.find((proveedor) => proveedor.id === id)?.nombre || 'Sin proveedor';
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