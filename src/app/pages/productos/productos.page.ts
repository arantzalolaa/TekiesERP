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
  pricetagOutline,
  saveOutline,
  searchOutline,
  trashOutline,
} from 'ionicons/icons';
import { ProductosService } from '../../services/productos.service';
import { Producto } from '../../models/database.models';

@Component({
  selector: 'app-productos',
  templateUrl: './productos.page.html',
  styleUrls: ['./productos.page.scss'],
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
    IonToggle,
    IonSpinner,
    IonToast,
  ],
})
export class ProductosPage implements OnInit {
  productos: Producto[] = [];
  filteredProductos: Producto[] = [];

  loading = true;
  saving = false;
  showForm = false;
  editingId: number | null = null;
  search = '';

  toastOpen = false;
  toastMessage = '';

  form: Producto = this.getEmptyForm();

  constructor(private productosService: ProductosService) {
    addIcons({
      addOutline,
      arrowBackOutline,
      closeOutline,
      createOutline,
      cubeOutline,
      pricetagOutline,
      saveOutline,
      searchOutline,
      trashOutline,
    });
  }

  async ngOnInit() {
    await this.loadProductos();
  }

  getEmptyForm(): Producto {
    return {
      nombre: '',
      sku: '',
      descripcion: '',
      categoria: 'Pulsera UV',
      stock: 0,
      stock_minimo: 20,
      costo_estimado: 0,
      precio_venta: 0,
      activo: true,
    };
  }

  async loadProductos() {
    this.loading = true;
    this.productos = await this.productosService.getAll();
    this.applyFilter();
    this.loading = false;
  }

  applyFilter() {
    const text = this.search.toLowerCase().trim();

    if (!text) {
      this.filteredProductos = [...this.productos];
      return;
    }

    this.filteredProductos = this.productos.filter((producto) =>
      [
        producto.nombre,
        producto.sku,
        producto.categoria,
        producto.descripcion || '',
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

  openEdit(producto: Producto) {
    this.form = { ...producto };
    this.editingId = producto.id ?? null;
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

    if (this.form.precio_venta < this.form.costo_estimado) {
      this.showToast('El precio de venta no debería ser menor al costo.');
      return;
    }

    this.saving = true;

    const payload: Producto = {
      nombre: this.form.nombre.trim(),
      sku: this.form.sku.trim().toUpperCase(),
      descripcion: this.form.descripcion?.trim() || null,
      categoria: this.form.categoria.trim(),
      stock: Number(this.form.stock) || 0,
      stock_minimo: Number(this.form.stock_minimo) || 0,
      costo_estimado: Number(this.form.costo_estimado) || 0,
      precio_venta: Number(this.form.precio_venta) || 0,
      activo: !!this.form.activo,
    };

    const result = this.editingId
      ? await this.productosService.update(this.editingId, payload)
      : await this.productosService.create(payload);

    this.saving = false;

    if (result.error) {
      this.showToast(result.error.message);
      return;
    }

    this.showToast(this.editingId ? 'Producto actualizado.' : 'Producto creado.');
    this.closeForm();
    await this.loadProductos();
  }

  async delete(producto: Producto) {
    if (!producto.id) return;

    const confirmDelete = confirm(`¿Eliminar ${producto.nombre}?`);

    if (!confirmDelete) return;

    const { error } = await this.productosService.delete(producto.id);

    if (error) {
      this.showToast(error.message);
      return;
    }

    this.showToast('Producto eliminado.');
    await this.loadProductos();
  }

  getMargin(producto: Producto): number {
    if (!producto.precio_venta) return 0;
    return ((producto.precio_venta - producto.costo_estimado) / producto.precio_venta) * 100;
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