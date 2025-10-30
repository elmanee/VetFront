export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio_venta: number;
  unidad_medida: string;
  categoria?: string;
  categoria_id?: number;
}
