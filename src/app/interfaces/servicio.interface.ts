export interface Servicio {
  id?: number;
  titulo: string;
  descripcion: string;
  imagen_url?: string;
  activo: boolean;
  precio?: number;
}