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
  IonToast, IonHeader, IonToolbar } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline,
  arrowBackOutline,
  cashOutline,
  closeOutline,
  createOutline,
  saveOutline,
  searchOutline,
  trashOutline,
} from 'ionicons/icons';
import { FinanzasService } from '../../services/finanzas.service';
import { Finanzas, TipoMovimiento } from '../../models/database.models';

@Component({
  selector: 'app-finanzas',
  templateUrl: './finanzas.page.html',
  styleUrls: ['./finanzas.page.scss'],
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
    IonToggle,
    IonSpinner,
    IonToast,
  ],
})
export class FinanzasPage implements OnInit {
  movimientos: Finanzas[] = [];
  filteredMovimientos: Finanzas[] = [];

  tipos: TipoMovimiento[] = ['ingreso', 'gasto'];

  loading = true;
  saving = false;
  showForm = false;
  editingId: number | null = null;
  search = '';

  toastOpen = false;
  toastMessage = '';

  form: Finanzas = this.getEmptyForm();

  constructor(private finanzasService: FinanzasService) {
    addIcons({
      addOutline,
      arrowBackOutline,
      cashOutline,
      closeOutline,
      createOutline,
      saveOutline,
      searchOutline,
      trashOutline,
    });
  }

  async ngOnInit() {
    await this.loadMovimientos();
  }

  getEmptyForm(): Finanzas {
    return {
      fecha: new Date().toISOString().slice(0, 10),
      tipo: 'gasto',
      concepto: '',
      monto: 0,
      modulo_origen: 'finanzas',
      referencia_id: null,
      pagado: true,
      notas: '',
    };
  }

  async loadMovimientos() {
    this.loading = true;
    this.movimientos = await this.finanzasService.getAll();
    this.applyFilter();
    this.loading = false;
  }

  applyFilter() {
    const text = this.search.toLowerCase().trim();

    if (!text) {
      this.filteredMovimientos = [...this.movimientos];
      return;
    }

    this.filteredMovimientos = this.movimientos.filter((movimiento) =>
      [
        movimiento.fecha,
        movimiento.tipo,
        movimiento.concepto,
        movimiento.modulo_origen || '',
        movimiento.notas || '',
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

  openEdit(movimiento: Finanzas) {
    this.form = { ...movimiento };
    this.editingId = movimiento.id ?? null;
    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
    this.editingId = null;
    this.form = this.getEmptyForm();
  }

  async save() {
    if (!this.form.concepto || Number(this.form.monto) <= 0) {
      this.showToast('Completa concepto y monto válido.');
      return;
    }

    const payload: Finanzas = {
      fecha: this.form.fecha,
      tipo: this.form.tipo,
      concepto: this.form.concepto.trim(),
      monto: Number(this.form.monto),
      modulo_origen: this.form.modulo_origen?.trim() || 'finanzas',
      referencia_id: this.form.referencia_id ? Number(this.form.referencia_id) : null,
      pagado: !!this.form.pagado,
      notas: this.form.notas?.trim() || null,
    };

    this.saving = true;

    const result = this.editingId
      ? await this.finanzasService.update(this.editingId, payload)
      : await this.finanzasService.create(payload);

    this.saving = false;

    if (result.error) {
      this.showToast(result.error.message);
      return;
    }

    this.showToast(this.editingId ? 'Movimiento actualizado.' : 'Movimiento creado.');
    this.closeForm();
    await this.loadMovimientos();
  }

  async delete(movimiento: Finanzas) {
    if (!movimiento.id) return;

    const confirmDelete = confirm(`¿Eliminar movimiento #${movimiento.id}?`);

    if (!confirmDelete) return;

    const { error } = await this.finanzasService.delete(movimiento.id);

    if (error) {
      this.showToast(error.message);
      return;
    }

    this.showToast('Movimiento eliminado.');
    await this.loadMovimientos();
  }

  getIngresos(): number {
    return this.movimientos
      .filter((m) => m.tipo === 'ingreso')
      .reduce((sum, item) => sum + Number(item.monto), 0);
  }

  getGastos(): number {
    return this.movimientos
      .filter((m) => m.tipo === 'gasto')
      .reduce((sum, item) => sum + Number(item.monto), 0);
  }

  getFlujo(): number {
    return this.getIngresos() - this.getGastos();
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