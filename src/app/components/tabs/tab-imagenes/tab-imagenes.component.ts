import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ImagenService } from '../../../services/imagen.service';

@Component({
  selector: 'app-tab-imagenes',
  imports: [
    CommonModule, ReactiveFormsModule
  ],
  templateUrl: './tab-imagenes.component.html',
  styleUrl: './tab-imagenes.component.scss'
})
export class TabImagenesComponent implements OnInit, OnChanges {

  @Input() consulta: any;
  @Input() modoEdicion = false;
  @Output() guardado = new EventEmitter<any>();

  form!: FormGroup;
  loading = false;
  previews: string[] = [];
  imagenesExistentes: any[] = [];
  datosYaCargados = false;

  constructor(
    private fb: FormBuilder,
    private imagenServ: ImagenService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      imagenes: this.fb.array([
        this.crearImagenForm()
      ])
    });

    this.previews.push('');


    if (this.consulta && this.modoEdicion && !this.datosYaCargados) {
      this.cargarImagenesExistentes();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['consulta'] && this.consulta && this.modoEdicion && this.form && !this.datosYaCargados) {
      this.cargarImagenesExistentes();
    }
  }

  get imagenesArr(): FormArray {
    return this.form.get('imagenes') as FormArray;
  }

  crearImagenForm(imagen?: any): FormGroup {
    return this.fb.group({
      id_imagen: [imagen?.id_imagen || null],
      imagen_base64: [imagen?.imagen_base64 || ''],
      descripcion: [imagen?.descripcion || ''],
      tipo_imagen: [imagen?.tipo_imagen || 'Fotografía'],
      imagen_modificada: [false]
    });
  }

  cargarImagenesExistentes() {
    if (!this.consulta?.id_consulta || this.datosYaCargados) return;


    this.imagenServ.obtenerPorConsulta(this.consulta.id_consulta).subscribe({
      next: (resp) => {
        this.imagenesExistentes = resp.data || [];

        if (this.imagenesExistentes.length > 0) {
          this.imagenesArr.clear();
          this.previews = [];

          this.imagenesExistentes.forEach((img, index) => {
            this.imagenesArr.push(this.crearImagenForm(img));
            this.previews.push(img.imagen_base64);
          });

        }

        this.datosYaCargados = true;
      },
      error: (err) => {
        console.error(' Error al cargar imágenes:', err);
      }
    });
  }

  agregarImagen() {
    this.imagenesArr.push(this.crearImagenForm());
    this.previews.push('');
  }

  quitarImagen(i: number) {
    const imagen = this.imagenesArr.at(i).value;

    if (imagen.id_imagen) {

      this.imagenServ.eliminar(imagen.id_imagen).subscribe({
        next: () => {
          this.imagenesArr.removeAt(i);
          this.previews.splice(i, 1);
        },
        error: (err) => {
          console.error('Error al eliminar:', err);
        }
      });
    } else {
      this.imagenesArr.removeAt(i);
      this.previews.splice(i, 1);
    }
  }

  async onFileSelected(event: any, index: number) {
    const file = event.target.files[0];
    if (!file) return;


    const base64 = await this.convertFileToBase64(file);
    const formGroup = this.imagenesArr.at(index);

    formGroup.get('imagen_base64')?.setValue(base64);
    formGroup.get('imagen_modificada')?.setValue(true);
    this.previews[index] = base64;

  }

  convertFileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(null);
      reader.readAsDataURL(file);
    });
  }

  onCampoModificado(index: number) {
    const formGroup = this.imagenesArr.at(index);
    if (formGroup.get('id_imagen')?.value) {
      formGroup.get('imagen_modificada')?.setValue(true);
    }
  }

  guardar() {
    if (!this.consulta?.id_consulta) {
      return;
    }


    const todasLasImagenes = this.form.value.imagenes;

    const imagenesNuevas = todasLasImagenes.filter((img: any) =>
      !img.id_imagen && img.imagen_base64
    );

    const imagenesModificadas = todasLasImagenes.filter((img: any) =>
      img.id_imagen && img.imagen_modificada
    );

    if (imagenesNuevas.length > 0) {
      const payloadNuevas = {
        consulta_id: this.consulta.id_consulta,
        imagenes: imagenesNuevas.map((img: any) => ({
          imagen_base64: img.imagen_base64,
          descripcion: img.descripcion,
          tipo_imagen: img.tipo_imagen
        }))
      };

      this.loading = true;

      this.imagenServ.subirImagenes(payloadNuevas).subscribe({
        next: (resp) => {

          if (imagenesModificadas.length > 0) {
            this.actualizarImagenesExistentes(imagenesModificadas);
          } else {
            this.finalizarGuardado();
          }
        },
        error: (err) => {
          console.error('Error al guardar nuevas:', err);
          this.loading = false;
        }
      });
    }
    else if (imagenesModificadas.length > 0) {
      this.loading = true;
      this.actualizarImagenesExistentes(imagenesModificadas);
    }
    else {
      this.guardado.emit('ok');
    }
  }

  actualizarImagenesExistentes(imagenes: any[]) {

    let completadas = 0;
    const total = imagenes.length;

    imagenes.forEach((img) => {
      const payload: any = {
        descripcion: img.descripcion,
        tipo_imagen: img.tipo_imagen
      };

      if (img.imagen_modificada && img.imagen_base64) {
        payload.imagen_base64 = img.imagen_base64;
      }


      this.imagenServ.actualizar(img.id_imagen, payload).subscribe({
        next: () => {
          completadas++;

          if (completadas === total) {
            this.finalizarGuardado();
          }
        },
        error: (err) => {
          console.error(`Error al actualizar imagen ${img.id_imagen}:`, err);
          completadas++;

          if (completadas === total) {
            this.finalizarGuardado();
          }
        }
      });
    });
  }

  finalizarGuardado() {
    this.loading = false;
    this.guardado.emit('ok');

    if (this.modoEdicion) {
      this.datosYaCargados = false;
      this.cargarImagenesExistentes();
    } else {
      this.form.reset();
      this.imagenesArr.clear();
      this.imagenesArr.push(this.crearImagenForm());
      this.previews = [''];
    }
  }
}
