export interface CitasMensuales {
  mes: string;       
  Atendidas: number; 
  Canceladas: number; 
}

export interface RankingClientes {
  cliente_id: number;
  nombre: string;
  citas: number; 
}

export interface TopVentas {
  producto_id: number;
  nombre: string;
  cantidad_total: number; 
}

export interface DashboardData {
  citas_mensuales: CitasMensuales[];
  ranking_clientes: RankingClientes[];
  top_ventas: TopVentas[];
  fecha_generacion: string; 
}

export interface ApiResponse<T> {
  status: string;
  data: T;
  message: string; 
}
