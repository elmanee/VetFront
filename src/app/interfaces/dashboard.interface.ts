// Estructura para la Alerta de Stock Bajo
export interface StockBajo {
  producto_id: number;
  nombre_producto: string;
  stock_total: number; // Sum(l.cantidad_disponible)
}

// Estructura para la Alerta de Productos a Vencer
export interface ProductoAVencer {
  lote_id: number;
  nombre_producto: string;
  num_lote: string;
  cantidad_disponible: number;
  fecha_caducidad: string; 
}

// Estructura para la Gráfica de Productos más Vendidos
export interface TopProductoVendido {
  producto: string;
  total_vendido: number;
}

export interface StatsCitasHoy {
  total_citas_hoy: number;
  citas_confirmadas: number;
}

export interface StatsCitasPorConfirmar {
  total_por_confirmar: number;
}

export interface StatsCitasProximaSemana {
  total_proxima_semana: number;
}

export interface StatsCrecimiento {
  nuevos_clientes_mes: {
    total_nuevos_clientes: number;
  };
}

export interface StatsCitas {
  hoy: StatsCitasHoy;
  por_confirmar: StatsCitasPorConfirmar;
  proxima_semana: StatsCitasProximaSemana;
}

// Estructura principal de la respuesta del backend
export interface DashboardData {
  alertasStockBajo: StockBajo[];
  alertasProductosAVencer: ProductoAVencer[];
  graficaTopVendidos: TopProductoVendido[];
  statsCitas: StatsCitas; // Propiedad actualizada
  statsCrecimiento: StatsCrecimiento; // ¡Nueva propiedad!
}