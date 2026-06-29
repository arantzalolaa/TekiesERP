import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  IonContent,
  IonIcon,
  IonButton,
  IonInput,
  IonSpinner,
  IonToast, IonHeader, IonToolbar } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline,
  arrowBackOutline,
  businessOutline,
  closeOutline,
  createOutline,
  saveOutline,
  searchOutline,
  trashOutline,
} from 'ionicons/icons';
import { ProveedoresService } from '../../services/proveedores.service';
import { Proveedor } from '../../models/database.models';

@Component({
  selector: 'app-proveedores',
  templateUrl: './proveedores.page.html',
  styleUrls: ['./proveedores.page.scss'],
  standalone: true,
  imports: [IonToolbar, IonHeader, 
    CommonModule,
    FormsModule,
    RouterModule,
    IonContent,
    IonIcon,
    IonButton,
    IonInput,
    IonSpinner,
    IonToast,
  ],
})
export class ProveedoresPage implements OnInit {
  proveedores: Proveedor[] = [];
  filteredProveedores: Proveedor[] = [];

  loading = true;
  saving = false;
  showForm = false;
  editingId: number | null = null;
  search = '';

  toastOpen = false;
  toastMessage = '';

  form: Proveedor = this.getEmptyForm();

  constructor(private proveedoresService: ProveedoresService) {
    addIcons({
      addOutline,
      arrowBackOutline,
      businessOutline,
      closeOutline,
      createOutline,
      saveOutline,
      searchOutline,
      trashOutline,
    });
  }

  async ngOnInit() {
    await this.loadProveedores();
  }

  getEmptyForm(): Proveedor {
    return {
      nombre: '',
      contacto: '',
      telefono: '',
      correo: '',
      sitio_web: '',
      tipo_suministro: '',
      pais: 'México',
      estado: 'Activo',
    };
  }

  async loadProveedores() {
    this.loading = true;
    this.proveedores = await this.proveedoresService.getAll();
    this.applyFilter();
    this.loading = false;
  }

  applyFilter() {
    const text = this.search.toLowerCase().trim();

    if (!text) {
      this.filteredProveedores = [...this.proveedores];
      return;
    }

    this.filteredProveedores = this.proveedores.filter((proveedor) =>
      [
        proveedor.nombre,
        proveedor.contacto || '',
        proveedor.correo || '',
        proveedor.telefono || '',
        proveedor.tipo_suministro,
        proveedor.pais || '',
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

  openEdit(proveedor: Proveedor) {
    this.form = { ...proveedor };
    this.editingId = proveedor.id ?? null;
    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
    this.editingId = null;
    this.form = this.getEmptyForm();
  }

  async save() {
    if (!this.form.nombre || !this.form.tipo_suministro) {
      this.showToast('Completa nombre y tipo de suministro.');
      return;
    }

    const payload: Proveedor = {
      nombre: this.form.nombre.trim(),
      contacto: this.form.contacto?.trim() || null,
      telefono: this.form.telefono?.trim() || null,
      correo: this.form.correo?.trim() || null,
      sitio_web: this.form.sitio_web?.trim() || null,
      tipo_suministro: this.form.tipo_suministro.trim(),
      pais: this.form.pais?.trim() || 'México',
      estado: this.form.estado?.trim() || 'Activo',
    };

    this.saving = true;

    const result = this.editingId
      ? await this.proveedoresService.update(this.editingId, payload)
      : await this.proveedoresService.create(payload);

    this.saving = false;

    if (result.error) {
      this.showToast(result.error.message);
      return;
    }

    this.showToast(this.editingId ? 'Proveedor actualizado.' : 'Proveedor creado.');
    this.closeForm();
    await this.loadProveedores();
  }

  async delete(proveedor: Proveedor) {
    if (!proveedor.id) return;

    const confirmDelete = confirm(`¿Eliminar ${proveedor.nombre}?`);

    if (!confirmDelete) return;

    const { error } = await this.proveedoresService.delete(proveedor.id);

    if (error) {
      this.showToast(error.message);
      return;
    }

    this.showToast('Proveedor eliminado.');
    await this.loadProveedores();
  }

  showToast(message: string) {
    this.toastMessage = message;
    this.toastOpen = true;
  }
}