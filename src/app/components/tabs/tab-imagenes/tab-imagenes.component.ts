import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
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
export class TabImagenesComponent {

  @Input() consulta: any;
  @Output() guardado = new EventEmitter<any>();

  form!: FormGroup;
  loading = false;
  previews: string[] = [];

  constructor(
    private fb: FormBuilder,
    private imagenServ: ImagenService
  ) {}

  ngOnInit(): void {
    if (!this.consulta) return;

    this.form = this.fb.group({
      imagenes: this.fb.array([
        this.crearImagenForm()
      ])
    });

    this.previews.push('');
  }

  get imagenesArr(): FormArray {
    return this.form.get('imagenes') as FormArray;
  }

  crearImagenForm(): FormGroup {
    return this.fb.group({
      imagen_base64: [''],
      descripcion: [''],
      tipo_imagen: ['Fotografía']
    });
  }

  agregarImagen() {
    this.imagenesArr.push(this.crearImagenForm());
    this.previews.push('');
  }

  quitarImagen(i: number) {
    if (this.imagenesArr.length > 1) {
      this.imagenesArr.removeAt(i);
      this.previews.splice(i, 1);
    }
  }

  async onFileSelected(event: any, index: number) {
    const file = event.target.files[0];

    if (!file) return;

    const base64 = await this.convertFileToBase64(file);
    this.imagenesArr.at(index).get('imagen_base64')?.setValue(base64);
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

  guardar() {
    if (!this.consulta?.id_consulta) return;

    const payload = {
      consulta_id: this.consulta.id_consulta,
      imagenes: this.form.value.imagenes
    };

    this.loading = true;

    this.imagenServ.subirImagenes(payload).subscribe({
      next: (resp) => {
        this.loading = false;
        this.guardado.emit(resp.data);

        this.form.reset();
        this.form.setControl('imagenes', this.fb.array([this.crearImagenForm()]));
        this.previews = [''];
        this.guardado.emit('ok');

      },
      error: () => {
        this.loading = false;
      }
    });
  }

}
