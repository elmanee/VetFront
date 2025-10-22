import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// Solución al Error 2304: Importar CitasService Y la Interfaz Cita
import { CitasService, Cita } from '../../services/citas.service';
import { FiltroporCliente } from '../../pipes/filtrado-por-cliente.pipe';

// RQF01 - Dependencias: Necesitamos el módulo de formularios y el Pipe de filtrado.
@Component({
  selector: 'app-cita-form',
  standalone: true, // Asumo que el componente es standalone
  imports: [CommonModule, FormsModule, FiltroporCliente],
  templateUrl: './cita-form.component.html',
  styleUrl: './cita-form.component.scss',
})
export class CitaFormComponent implements OnInit {

  // RQF01 - ENTRADA DE DATOS: Objeto que recoge los datos del formulario.
  // Usamos Omit<Cita, 'id'> porque el ID lo genera el servicio/backend.
  nuevaCita: Omit<Cita, 'id'> = {
    fecha: '',
    hora: '',
    clienteId: 0,
    mascotaId: 0,
    veterinarioId: 0,
    motivo: '',
    telefonoContacto: '',
  };

  // RQF01 - DATOS DE SELECCIÓN: Listas vacías por ahora.
  // Se llenarán cuando el usuario lo solicite para las pruebas.
  // clientes: { id: number, nombre: string }[] = [];
  // mascotas: { id: number, nombre: string, clienteId: number }[] = [];
  // veterinarios: { id: number, nombre: string }[] = [];
  // DATOS MOCKEADOS: Simulamos que estos datos vienen de otros servicios (Clientes, Mascotas, Veterinarios).
  // Es importante tener los IDs correctos para la base de datos.
  clientes: { id: number, nombre: string }[] = [
    { id: 101, nombre: 'Agustín López' },
    { id: 102, nombre: 'Vanesa Medrano' }
  ];

  mascotas: { id: number, nombre: string, clienteId: number }[] = [
    { id: 1, nombre: 'Firulais', clienteId: 101 },
    { id: 2, nombre: 'Michi', clienteId: 101 },
    { id: 3, nombre: 'Max', clienteId: 102 },
    { id: 4, nombre: 'Luna', clienteId: 102 }
  ];

  veterinarios: { id: number, nombre: string }[] = [
    { id: 1, nombre: 'Dr. Torres (Veterinario ID 1)' },
    { id: 2, nombre: 'Dra. Pérez (Veterinario ID 2)' }
  ];

  // Variables para mostrar el resultado al usuario (RQF01 - Salida Esperada).
  mensaje: string = '';
  mensajeClase: string = '';

  // RQF01 - Evidencia de Arquitectura (Actividad 3): INYECCIÓN DEL SERVICIO.
  // Aquí es donde el Componente se conecta con la Capa de Lógica.
  constructor(private citasService: CitasService) {}

  ngOnInit(): void {
    // Lógica que se ejecuta al cargar el componente (por ahora, solo un log).
    console.log('Componente de registro de citas cargado.');
  }

  // RQF01 - ALCANCE: Función principal para registrar citas.
  registrarCita() {
    // 1. Mostrar estado inicial
    this.mensaje = 'Paso 1: Iniciando validación de cita...';
    this.mensajeClase = 'info';

    // RQF01 - VALIDACIÓN: Verificamos si el horario está disponible usando el método del servicio.
    const estaDisponible = this.citasService.verificarDisponibilidad(
      this.nuevaCita.fecha,
      this.nuevaCita.hora,
      this.nuevaCita.veterinarioId
    );

    if (estaDisponible === false) {
      // 1.1 Si hay conflicto, mostramos el ERROR y terminamos.
      this.mensaje =
        'ERROR: El horario seleccionado NO está disponible. Seleccione otra hora/fecha o veterinario.';
      this.mensajeClase = 'error';
      return;
      // El 'return' es clave para que no continúe el registro.
    }

    // 2. Si pasa la validación, procedemos a registrar.
    this.mensaje =
      'Paso 2: Validación exitosa. Enviando datos al servicio (simulando API REST)...';

    // RQF01 - SALIDA ESPERADA: Llamada al Servicio (que simula la API REST).
    // Usamos .subscribe() para manejar la respuesta asíncrona (aunque el servicio es síncrono por ahora).
    this.citasService.registrarCita(this.nuevaCita as Cita).subscribe({
      next: (citaRegistrada) => {
        // 2.1 Muestra el éxito y la confirmación automática (simulada en el servicio).
        this.mensaje = `Paso 3: ¡Éxito! Cita ID ${citaRegistrada.id} registrada. Verifique la consola para la NOTIFICACIÓN automática.`;
        this.mensajeClase = 'success';
        this.resetFormulario();
      },
      error: (err) => {
        // 2.2 Si el servicio lanza un error (ej. validación interna o error de red), lo mostramos.
        this.mensaje = `ERROR: No se pudo completar el registro: ${err.message}`;
        this.mensajeClase = 'error';
      },
    });
  }

  // Función para resetear el formulario.
  resetFormulario() {
    this.nuevaCita = {
      fecha: '',
      hora: '',
      clienteId: 0,
      mascotaId: 0,
      veterinarioId: 0,
      motivo: '',
      telefonoContacto: '',
    };
    // Reiniciamos el mensaje después de un tiempo para no distraer.
    setTimeout(() => {
      this.mensaje = '';
      this.mensajeClase = '';
    }, 5000);
  }

  
}
