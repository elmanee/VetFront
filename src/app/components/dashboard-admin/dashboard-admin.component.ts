import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { DashboardService } from '../../services/dashboard.service';
import { NgxEchartsModule } from 'ngx-echarts';
import Swal from 'sweetalert2'; 
import { EChartsOption } from 'echarts';
import { DashboardData, CitasMensuales, RankingClientes, TopVentas, RankingVeterinarios, ApiResponse, TopAnimales, StockBajo, TopServicios } from '../../interfaces/dashboard.interface'; 

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [CommonModule, NgxEchartsModule], 
  templateUrl: './dashboard-admin.component.html',
  styleUrl: './dashboard-admin.component.scss'
})
export class DashboardAdminComponent implements OnInit {

  dashboardData: DashboardData | null = null; 

  topAnimales: TopAnimales[] = [];
  stockBajo: StockBajo[] = [];
  topServicios: TopServicios[] = [];
  
  citasChartOptions: EChartsOption = {};
  clientesChartOptions: EChartsOption = {};
  ventasChartOptions: EChartsOption = {};
  veterinariosChartOptions: EChartsOption = {}; 
  animalesChartOptions: EChartsOption = {};
  stockChartOptions: EChartsOption = {};
  serviciosChartOptions: EChartsOption = {};

  cargando: boolean = true; 

  constructor(private dashboardService: DashboardService) { }

  ngOnInit(): void {
    this.cargarDatosDashboard();
  }

  cargarDatosDashboard() {
    this.cargando = true;
    
    this.dashboardService.getDashboardAdminData().subscribe({
      next: (response: ApiResponse<DashboardData>) => {
        this.dashboardData = response.data; 
        
        if (this.dashboardData) {
            this.setCitasMensualesChart(this.dashboardData.citas_mensuales);
            this.setRankingClientesChart(this.dashboardData.ranking_clientes);
            this.setTopVentasChart(this.dashboardData.top_ventas);
            this.setVeterinarioRankingChart(this.dashboardData.ranking_veterinarios); 
            this.topAnimales = this.dashboardData.top_animales;
            this.stockBajo = this.dashboardData.stock_bajo;
            this.topServicios = this.dashboardData.top_servicios;
            this.setTopAnimalesChart(this.topAnimales);
            this.setStockBajoChart(this.stockBajo);
            this.setTopServiciosChart(this.topServicios);
        }

        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar dashboard (Facade):', err);
        this.cargando = false;
        Swal.fire('Error de Conexión', 'No se pudieron cargar los datos del Facade de estadísticas.', 'error');
      }
    });
  }
  
  setCitasMensualesChart(data: CitasMensuales[]): void {
    const meses = data.map(item => item.mes);
    const atendidas = data.map(item => item.Atendidas);
    const canceladas = data.map(item => item.Canceladas);
    
    const greenGradient = {
        type: 'linear' as const, 
        x: 0, y: 0, x2: 0, y2: 1,
        colorStops: [{ offset: 0, color: '#4CAF50' }, { offset: 1, color: '#A5D6A7' }]
    };
    
    const redColor = '#E53935';

    this.citasChartOptions = {
        backgroundColor: 'transparent',
        title: { 
            text: 'Tendencia Mensual de Citas (Atendidas vs. Canceladas)', 
            left: 'center',
            textStyle: { color: '#333' }
        },
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        legend: { data: ['Atendidas', 'Canceladas'], top: '5%', textStyle: { color: '#666' } },
        xAxis: { 
            type: 'category', 
            data: meses, 
            axisLabel: { rotate: 45, color: '#555' },
            axisLine: { lineStyle: { color: '#ccc' } }
        },
        yAxis: { 
            type: 'value', 
            name: 'Total Citas', 
            axisLabel: { color: '#555' },
            splitLine: { lineStyle: { type: 'dashed' } }
        },
        series: [
            { 
                name: 'Atendidas', 
                type: 'bar', 
                stack: 'citas', 
                data: atendidas, 
                itemStyle: { color: greenGradient },
                barWidth: '60%'
            },
            { 
                name: 'Canceladas', 
                type: 'bar', 
                stack: 'citas', 
                data: canceladas, 
                itemStyle: { color: redColor },
                barWidth: '60%'
            }
        ],
        dataZoom: [{ type: 'inside' }, { type: 'slider', bottom: 10 }]
    };
  }

  setRankingClientesChart(data: RankingClientes[]): void {
    const nombres = data.map(item => item.nombre).reverse();
    const citas = data.map(item => item.citas).reverse();
    
    const goldGradient = {
        type: 'linear' as const, 
        x: 0, y: 0, x2: 1, y2: 0,
        colorStops: [{ offset: 0, color: '#FFD95A' }, { offset: 1, color: '#FFB300' }]
    };

    this.clientesChartOptions = {
        backgroundColor: 'transparent',
        title: { text: 'Top 10 Clientes Frecuentes', left: 'center' },
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        grid: { left: '3%', right: '8%', bottom: '3%', containLabel: true },
        xAxis: { type: 'value', name: 'Citas Atendidas', show: true, axisLabel: { color: '#555' } },
        yAxis: { 
            type: 'category', 
            data: nombres,
            axisLabel: { color: '#333', fontWeight: 'bold' } 
        },
        series: [
            {
                name: 'Citas',
                type: 'bar',
                data: citas,
                barWidth: '60%', 
                itemStyle: { 
                    borderRadius: [0, 5, 5, 0], 
                    color: goldGradient 
                }, 
                label: { 
                    show: true, 
                    position: 'right', 
                    valueAnimation: true,
                    fontWeight: 'bold'
                }
            }
        ]
    };
  }
  
  setTopVentasChart(data: TopVentas[]): void {
    const pieData = data.map(item => ({ name: item.nombre, value: item.cantidad_total }));

    const colorPalette = ['#00BFA5', '#5C6BC0', '#FF7043', '#29B6F6', '#8D6E63'];

    this.ventasChartOptions = {
        backgroundColor: 'transparent',
        title: { text: 'Distribución Top 5 Productos Vendidos', left: 'center' },
        color: colorPalette,
        tooltip: { 
            trigger: 'item', 
            formatter: '{b}: {c} unidades ({d}%)' 
        },
        legend: { 
            orient: 'vertical', 
            right: 0, 
            top: 'middle', 
            data: data.map(item => item.nombre) 
        },
        series: [
            {
                name: 'Ventas',
                type: 'pie',
                radius: ['40%', '65%'], 
                center: ['35%', '50%'], 
                data: pieData,
                itemStyle: { 
                    borderColor: '#fff', 
                    borderWidth: 2, 
                    shadowBlur: 10, 
                    shadowColor: 'rgba(0, 0, 0, 0.2)' 
                },
                label: {
                    formatter: '{d}%', 
                    color: '#333'
                }
            }
        ]
    };
  }
  
  setVeterinarioRankingChart(data: RankingVeterinarios[]): void { 
    
    const nombres = data.map(item => item.nombre).reverse();
    const citas = data.map(item => item.citas).reverse();
    
    const blueGradient = {
        type: 'linear' as const, 
        x: 0, y: 0, x2: 1, y2: 0,
        colorStops: [{ offset: 0, color: '#007BFF' }, { offset: 1, color: '#00CCFF' }]
    };

    this.veterinariosChartOptions = {
        backgroundColor: 'transparent',
        title: { text: 'Veterinarios con Más Citas Atendidas', left: 'center' },
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        grid: { left: '3%', right: '8%', bottom: '3%', containLabel: true },
        xAxis: { type: 'value', name: 'Citas Completadas', show: true, axisLabel: { color: '#555' } },
        yAxis: { 
            type: 'category', 
            data: nombres,
            axisLabel: { color: '#333', fontWeight: 'bold' } 
        },
        series: [
            {
                name: 'Citas',
                type: 'bar',
                barWidth: '60%', 
                data: citas,
                itemStyle: { 
                    borderRadius: [0, 5, 5, 0],
                    color: blueGradient 
                }, 
                label: { 
                    show: true, 
                    position: 'right', 
                    valueAnimation: true,
                    fontWeight: 'bold'
                }
            }
        ]
    };
  }

  setTopAnimalesChart(data: TopAnimales[]): void {
    const pieData = data.map(item => ({ name: item.nombre, value: item.citas }));
    const colorPalette = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'];

    this.animalesChartOptions = {
        backgroundColor: 'transparent',
        title: { 
            text: 'Top 5 Tipos de Animales más Frecuentes', 
            left: 'center',
            textStyle: { color: '#333' }
        },
        color: colorPalette,
        tooltip: { 
            trigger: 'item', 
            formatter: '{b}: {c} citas ({d}%)' 
        },
        legend: { 
            orient: 'vertical', 
            right: 0, 
            top: 'middle', 
            data: data.map(item => item.nombre) 
        },
        series: [
            {
                name: 'Citas por Especie',
                type: 'pie',
                radius: ['40%', '65%'], 
                center: ['35%', '50%'], 
                data: pieData,
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                },
                label: {
                    formatter: '{d}%', 
                    color: '#333'
                }
            }
        ]
    };
  }

  setStockBajoChart(data: StockBajo[]): void {
    const nombres = data.map(p => p.nombre);
    const stock = data.map(p => p.stock);
    const stockMinimo = data.map(p => p.stockMinimo);

    this.stockChartOptions = {
        backgroundColor: 'transparent',
        title: { text: 'Alerta de Productos con Stock Bajo', left: 'center' },
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        grid: { left: '3%', right: '8%', bottom: '15%', containLabel: true },
        legend: { data: ['Stock Actual', 'Stock Mínimo'], bottom: 0 },
        xAxis: {
            type: 'category',
            data: nombres,
            axisLabel: {
                rotate: 45, 
                color: '#555'
            },
            axisLine: { lineStyle: { color: '#ccc' } }
        },
        yAxis: { 
            type: 'value',
            name: 'Unidades',
            axisLabel: { color: '#555' },
            splitLine: { lineStyle: { type: 'dashed' } }
        },
        series: [
            {
                name: 'Stock Actual',
                type: 'bar',
                data: stock,
                itemStyle: { color: '#dc3545' } 
            },
            {
                name: 'Stock Mínimo',
                type: 'line',
                data: stockMinimo,
                itemStyle: { color: '#ffc107' }, 
                symbol: 'none'
            }
        ]
    };
  }
  
  setTopServiciosChart(data: TopServicios[]): void {
    const sortedData = data.slice(0, 5).sort((a, b) => a.count - b.count);
    const servicios = sortedData.map(s => s.titulo);
    const counts = sortedData.map(s => s.count);

    const purpleGradient = {
        type: 'linear' as const, 
        x: 0, y: 0, x2: 1, y2: 0,
        colorStops: [{ offset: 0, color: '#9c27b0' }, { offset: 1, color: '#ce93d8' }]
    };

    this.serviciosChartOptions = {
        backgroundColor: 'transparent',
        title: { text: 'Top 5 Servicios Más Solicitados', left: 'center' },
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        grid: { left: '3%', right: '8%', bottom: '3%', containLabel: true },
        xAxis: { 
            type: 'value',
            name: 'Solicitudes',
            axisLabel: { color: '#555' }
        },
        yAxis: {
            type: 'category',
            data: servicios,
            axisLabel: { color: '#333', fontWeight: 'bold' } 
        },
        series: [
            {
                name: 'Solicitudes',
                type: 'bar',
                data: counts,
                barWidth: '70%', 
                itemStyle: { 
                    borderRadius: [0, 5, 5, 0],
                    color: purpleGradient 
                }, 
                label: { 
                    show: true, 
                    position: 'right', 
                    valueAnimation: true,
                    fontWeight: 'bold'
                }
            }
        ]
    };
  }
}