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

export interface RankingVeterinarios {
  veterinario_id: number;
  nombre: string;
  citas: number;
}

export interface TopAnimales {
  animal_id: number;
  nombre: string; 
  citas: number;
}

export interface StockBajo {
  nombre: string; 
  stock: number; 
  stockMinimo: number; 
}

export interface TopServicios {
  titulo: string; 
  count: number; 
}


export interface DashboardData {
  citas_mensuales: CitasMensuales[];
  ranking_clientes: RankingClientes[];
  top_ventas: TopVentas[];
  ranking_veterinarios: RankingVeterinarios[]; 
  top_animales: TopAnimales[];
  stock_bajo: StockBajo[];
  top_servicios: TopServicios[];
  
  fecha_generacion: string; 
}

export interface ApiResponse<T> {
  status: string;
  data: T;
  message: string; 
}
