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
    IonSelect,
    IonSelectOption,
    IonSpinner,
    IonToast,
  ],
})
export class ProveedoresPage implements OnInit {
  proveedores: Proveedor[] = [];
  filteredProveedores: Proveedor[] = [];

  estados = ['Activo', 'Inactivo', 'Suspendido'];
  tiposSuministro = [
    'Componentes electrónicos',
    'Microcontroladores',
    'Sensores UV',
    'Baterías',
    'Carcasas y correas',
    'Empaque',
    'Servicios',
  ];

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
      tipo_suministro: 'Componentes electrónicos',
      pais: 'México',
      estado: 'Activo',
    };
  }

  async loadProveedores() {
    this.loading = true;
    this.proveedores = await this.proveedoresService.getAll();
    this.syncOptionValues();
    this.applyFilter();
    this.loading = false;
  }

  syncOptionValues() {
    this.proveedores.forEach((proveedor) => {
      if (proveedor.tipo_suministro && !this.tiposSuministro.includes(proveedor.tipo_suministro)) {
        this.tiposSuministro = [...this.tiposSuministro, proveedor.tipo_suministro];
      }

      if (proveedor.estado && !this.estados.includes(proveedor.estado)) {
        this.estados = [...this.estados, proveedor.estado];
      }
    });
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
        proveedor.estado || '',
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
    if (proveedor.tipo_suministro && !this.tiposSuministro.includes(proveedor.tipo_suministro)) {
      this.tiposSuministro = [...this.tiposSuministro, proveedor.tipo_suministro];
    }

    if (proveedor.estado && !this.estados.includes(proveedor.estado)) {
      this.estados = [...this.estados, proveedor.estado];
    }

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
      tipo_suministro: this.form.tipo_suministro,
      pais: this.form.pais?.trim() || 'México',
      estado: this.form.estado || 'Activo',
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
