import { Producto } from "./producto";

export interface Lote {
  id: number;
  producto_id: number;
  num_lote: string;
  cantidad_inicial: number;
  cantidad_disponible: number;
  fecha_caducidad: string;
  fecha_ingreso: string;
  proveedor_id: number;
  // Datos relacionados
  producto?: Producto;
  proveedor_nombre?: string;
  categoria?: string;
}
