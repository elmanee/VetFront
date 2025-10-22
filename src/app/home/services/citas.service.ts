import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs'; // Usamos Observable para simular llamadas asíncronas (como un Backend real)

// RQF01 - Interfaz de Datos: Define la estructura de una Cita
export interface Cita {
  id: number;
  fecha: string; // Formato YYYY-MM-DD
  hora: string; // Formato HH:MM
  clienteId: number;
  mascotaId: number;
  veterinarioId: number;
  motivo: string;
  telefonoContacto: string;
}

@Injectable({
  providedIn: 'root'
})
export class CitasService {
  // RQF01 - Base de Datos Simulada: Almacenamiento local de citas para la demo
  private citasRegistradas: Cita[] = [
    // Ejemplo de una cita registrada que usaremos para probar la VALIDACIÓN DE DISPONIBILIDAD
    {
      id: 1,
      fecha: '2025-10-25', // Fecha futura
      hora: '10:00',
      clienteId: 101,
      mascotaId: 1,
      veterinarioId: 1, // Dr. Torres
      motivo: 'Revisión anual',
      telefonoContacto: '5551234567'
    }
  ];
  private nextId: number = 2; // Contador simple para nuevos IDs

  constructor() {
    console.log("CitasService: Capa de Lógica de Negocio iniciada.");
  }

  // =========================================================================
  // RQF01 - ALCANCE: Funciones CRUD
  // =========================================================================

  /**
   * Registra una nueva cita. Simula el envío de datos a la API REST.
   * RQF01 - Salida Esperada: Citas registradas exitosamente con confirmación automática.
   * @param nuevaCita Datos de la cita a registrar.
   * @returns Observable<Cita> con la cita registrada.
   */
  registrarCita(nuevaCita: Omit<Cita, 'id'>): Observable<Cita> {
    console.log("Servicio: Recibiendo solicitud de registro de cita.");

    // Generación simple de ID
    const citaConId: Cita = { ...nuevaCita, id: this.nextId++ };

    // RQF01 - Base de Datos: Guardamos la cita en nuestra lista simulada.
    this.citasRegistradas.push(citaConId);

    // RQF01 - ALCANCE: Simulación de Confirmación Automatizada
    // Esto se haría en la capa de Backend (Node.js), pero lo simulamos aquí
    // para cumplir con la funcionalidad de la arquitectura.
    this.enviarConfirmacionAutomatica(citaConId);

    // Devolvemos la cita registrada como si viniera del Backend.
    return of(citaConId);
  }

  /**
   * Obtiene la lista completa de citas registradas.
   * RQF01 - Alcance: Usado por la Agenda del Veterinario/Recepcionista.
   * @returns Observable<Cita[]> con todas las citas.
   */
  obtenerTodasLasCitas(): Observable<Cita[]> {
    console.log("Servicio: Entregando todas las citas para la Agenda.");
    // Devolvemos una copia para evitar modificación directa.
    return of([...this.citasRegistradas]);
  }

  // =========================================================================
  // RQF01 - VALIDACIONES Y LÓGICA DE NEGOCIO
  // =========================================================================

  /**
   * RQF01 - VALIDACIÓN: Verifica la disponibilidad de horarios para evitar superposición.
   * RQF01 - VALIDACIÓN: Verifica la disponibilidad del veterinario asignado.
   * @param fecha Fecha solicitada.
   * @param hora Hora solicitada.
   * @param veterinarioId ID del veterinario asignado.
   * @returns true si está disponible, false si hay conflicto.
   */
  verificarDisponibilidad(fecha: string, hora: string, veterinarioId: number): boolean {
    console.log(`Servicio: Verificando disponibilidad para Vet ID ${veterinarioId} en ${fecha} a las ${hora}.`);

    const citaExistente = this.citasRegistradas.find(cita => {
      // RQF01 - Lógica: Busca si existe una cita en la MISMA fecha, hora Y veterinario.
      const conflictoMismoVeterinario = cita.veterinarioId === veterinarioId;
      const conflictoMismaFecha = cita.fecha === fecha;
      const conflictoMismaHora = cita.hora === hora;

      // Si las tres condiciones se cumplen, hay un CONFLICTO DE SUPERPOSICIÓN.
      return conflictoMismoVeterinario && conflictoMismaFecha && conflictoMismaHora;
    });

    // RQF01 - Salida: Si encontró una cita, devuelve false (NO disponible).
    if (citaExistente) {
      console.warn(`Servicio: ¡CONFLITO DETECTADO! Cita ID ${citaExistente.id} ya ocupa el horario.`);
      return false;
    }

    // Si no encontró conflictos, devuelve true (DISPONIBLE).
    console.log("Servicio: Horario y veterinario disponibles. Validación OK.");
    return true;
  }

  // =========================================================================
  // RQF01 - NOTIFICACIONES (Simulación)
  // =========================================================================

  /**
   * Simula el envío de una confirmación automática al cliente.
   * RQF01 - ALCANCE: Cliente puede solicitar citas y recibir confirmaciones automatizadas.
   * @param cita La cita que se acaba de registrar.
   */
  private enviarConfirmacionAutomatica(cita: Cita): void {
    const mensaje = `[VETFRONT] Cita confirmada. Cliente ID ${cita.clienteId}, Mascota ID ${cita.mascotaId}. Veterinario: ${cita.veterinarioId} el ${cita.fecha} a las ${cita.hora}. Contacto: ${cita.telefonoContacto}.`;

    // RQF01 - Salida Esperada: Se envían confirmaciones automáticas por SMS o Gmail.
    console.info("---------------------------------------------------------------------");
    console.info(`SIMULACIÓN DE ENVÍO DE NOTIFICACIÓN AUTOMÁTICA (RQF01):`);
    console.info(`Teléfono/Email: ${cita.telefonoContacto}`);
    console.info(`Mensaje: ${mensaje}`);
    console.info("---------------------------------------------------------------------");
  }

  // Simulación del sistema de recordatorios (RQF01: Recordatorio 24 horas)
  private generarRecordatorio() {
    // NOTA: Esta lógica se ejecutaría en un CRON JOB o Tarea Programada en el Backend (Node.js)
    // para revisar las citas y enviar el recordatorio 24 horas antes, no en el Frontend.
  }

  
}
