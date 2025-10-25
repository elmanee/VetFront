///Este Pipe es crucial para el formulario de registro de citas, ya que cumple con una restricción de la interfaz: "La lista de Mascotas solo debe mostrar las asociadas al Cliente seleccionado".

import { Pipe, PipeTransform } from '@angular/core';

// Definición simple de la estructura de Mascota para la claridad del código
interface Mascota {
  id: number;
  nombre: string;
  clienteId: number;
}

@Pipe({
  name: 'filtroporCliente',
  standalone: true // Usamos standalone para simplificar la importación en el componente
})
export class FiltroporCliente implements PipeTransform {

  /**
   * RQF01 - VALIDACIÓN VISUAL: Filtra una lista de mascotas (value)
   * para mostrar solo aquellas que pertenecen a un cliente específico (targetClienteId).
   * * @param value La lista completa de mascotas.
   * @param targetClienteId El ID del cliente seleccionado en el formulario.
   * @returns La lista de mascotas filtrada.
   */
  transform(value: Mascota[], targetClienteId: number): Mascota[] {
    // Si el ID del cliente no es válido (0), no mostramos ninguna mascota.
    if (!targetClienteId || targetClienteId === 0) {
      console.log('Pipe: Cliente no seleccionado, regresando lista vacía de mascotas.');
      return [];
    }

    // Código sencillo de filtrado: solo devolvemos las mascotas cuyo clienteId coincide.
    const mascotasFiltradas = value.filter(mascota => {
      // Usamos triple igualdad para una comparación estricta de IDs.
      return mascota.clienteId === targetClienteId;
    });

    console.log(`Pipe: Filtradas ${mascotasFiltradas.length} mascotas para el Cliente ID ${targetClienteId}.`);
    return mascotasFiltradas;
  }
}
