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
  IonToggle,
  IonSpinner,
  IonToast, IonHeader, IonToolbar, IonTitle } from '@ionic/angular/standalone';
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
import { VentasService, VentaDetalle } from '../../services/ventas.service';
import { Cliente, Producto, Venta } from '../../models/database.models';

@Component({
  selector: 'app-ventas',
  templateUrl: './ventas.page.html',
  styleUrls: ['./ventas.page.scss'],
  standalone: true,
  imports: [IonTitle, IonToolbar, IonHeader, 
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
    IonToggle,
    IonSpinner,
    IonToast,
  ],
})
export class VentasPage implements OnInit {
  ventas: VentaDetalle[] = [];
  filteredVentas: VentaDetalle[] = [];
  clientes: Cliente[] = [];
  productos: Producto[] = [];

  loading = true;
  saving = false;
  showForm = false;
  editingId: number | null = null;
  search = '';

  toastOpen = false;
  toastMessage = '';

  form: Venta = this.getEmptyForm();

  constructor(private ventasService: VentasService) {
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

  getEmptyForm(): Venta {
    return {
      cliente_id: 0,
      producto_id: 0,
      fecha: new Date().toISOString().slice(0, 10),
      cantidad: 1,
      precio_unitario: 0,
      costo_unitario: 0,
      estado: 'completada',
      pagada: true,
      metodo_pago: 'Tarjeta',
      notas: '',
    };
  }

  async loadData() {
    this.loading = true;

    const [ventas, clientes, productos] = await Promise.all([
      this.ventasService.getAll(),
      this.ventasService.getClientes(),
      this.ventasService.getProductos(),
    ]);

    this.ventas = ventas;
    this.clientes = clientes;
    this.productos = productos;
    this.applyFilter();
    this.loading = false;
  }

  applyFilter() {
    const text = this.search.toLowerCase().trim();

    if (!text) {
      this.filteredVentas = [...this.ventas];
      return;
    }

    this.filteredVentas = this.ventas.filter((venta) =>
      [
        venta.cliente,
        venta.tipo_cliente,
        venta.producto,
        venta.sku,
        venta.estado,
        venta.metodo_pago || '',
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

  openEdit(venta: VentaDetalle) {
    this.showToast('Para evitar duplicar movimientos de inventario, edita solo ventas nuevas desde Supabase si es necesario.');
  }

  closeForm() {
    this.showForm = false;
    this.editingId = null;
    this.form = this.getEmptyForm();
  }

  onProductoChange() {
    const producto = this.productos.find((item) => item.id === Number(this.form.producto_id));

    if (!producto) return;

    this.form.precio_unitario = producto.precio_venta;
    this.form.costo_unitario = producto.costo_estimado;
  }

  getSelectedProductStock(): number {
    const producto = this.productos.find((item) => item.id === Number(this.form.producto_id));
    return producto?.stock ?? 0;
  }

  async save() {
    if (!this.form.cliente_id || !this.form.producto_id) {
      this.showToast('Selecciona cliente y producto.');
      return;
    }

    if (Number(this.form.cantidad) <= 0) {
      this.showToast('La cantidad debe ser mayor a cero.');
      return;
    }

    if (Number(this.form.cantidad) > this.getSelectedProductStock()) {
      this.showToast('No hay stock suficiente para esta venta.');
      return;
    }

    const payload: Venta = {
      cliente_id: Number(this.form.cliente_id),
      producto_id: Number(this.form.producto_id),
      fecha: this.form.fecha,
      cantidad: Number(this.form.cantidad),
      precio_unitario: Number(this.form.precio_unitario),
      costo_unitario: Number(this.form.costo_unitario) || 0,
      estado: this.form.estado,
      pagada: !!this.form.pagada,
      metodo_pago: this.form.metodo_pago?.trim() || 'Tarjeta',
      notas: this.form.notas?.trim() || null,
    };

    this.saving = true;

    const result = await this.ventasService.create(payload);

    this.saving = false;

    if (result.error) {
      this.showToast(result.error.message);
      return;
    }

    this.showToast('Venta registrada.');
    this.closeForm();
    await this.loadData();
  }

  async delete(venta: VentaDetalle) {
    const confirmDelete = confirm(`¿Eliminar venta #${venta.id}?`);

    if (!confirmDelete) return;

    const { error } = await this.ventasService.delete(venta.id);

    if (error) {
      this.showToast(error.message);
      return;
    }

    this.showToast('Venta eliminada.');
    await this.loadData();
  }

  getTotalPreview(): number {
    return (Number(this.form.cantidad) || 0) * (Number(this.form.precio_unitario) || 0);
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