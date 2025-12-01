import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { DashboardService } from '../../services/dashboard.service';
import { NgxEchartsModule } from 'ngx-echarts';
import Swal from 'sweetalert2'; 
import { EChartsOption } from 'echarts';
import { DashboardData, CitasMensuales, RankingClientes, TopVentas, ApiResponse } from '../../interfaces/dashboard.interface'; 

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [CommonModule, NgxEchartsModule], 
  templateUrl: './dashboard-admin.component.html',
  styleUrl: './dashboard-admin.component.scss'
})
export class DashboardAdminComponent implements OnInit {

  dashboardData: DashboardData | null = null; 

  citasChartOptions: EChartsOption = {};
  clientesChartOptions: EChartsOption = {};
  ventasChartOptions: EChartsOption = {};
  veterinariosChartOptions: EChartsOption = {};   
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
            this.setVeterinarioRankingChart(this.dashboardData.citas_mensuales); 
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
  
    setVeterinarioRankingChart(citasData: CitasMensuales[]): void {
    const rankingVets = [
        { nombre: 'Dra. Elena Ramos', citas: 90 },
        { nombre: 'Dr. Ricardo Velez', citas: 75 },
        { nombre: 'Dr. Hugo Chávez', citas: 50 },
        { nombre: 'Dra. Sofía Mora', citas: 45 },
    ];
    
    const nombres = rankingVets.map(item => item.nombre).reverse();
    const citas = rankingVets.map(item => item.citas).reverse();
    
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
}