//Este Pipe lo utilizaremos más tarde en la vista de la Agenda del Veterinario
// (AgendaView) para encontrar rápidamente el nombre de un Cliente
// o Mascota a partir de su ID, haciendo el código de la vista (TS) más limpio.
import { Pipe, PipeTransform } from '@angular/core';

// Definición de una interfaz simple para que el Pipe pueda buscar Clientes, Veterinarios, etc.
interface ItemConId {
  id: number;
  nombre: string;
}

@Pipe({
  name: 'filtradoPorId', // Nombre simple y descriptivo para el HTML
  standalone: true
})
export class FiltradoPorId implements PipeTransform {

  /**
   * Función de utilidad para encontrar y devolver el nombre de un elemento (Cliente, Veterinario) por su ID.
   * Es esencial para mostrar datos legibles en la Agenda (RQF01 - Salida Esperada).
   * @param listaDeItems La lista completa de elementos (ej. Clientes o Veterinarios).
   * @param idABuscar El ID del elemento que queremos encontrar.
   * @param propiedad El nombre de la propiedad a devolver ('nombre' por defecto).
   * @returns El nombre del elemento o un mensaje de error si no se encuentra.
   */
  transform(listaDeItems: ItemConId[], idABuscar: number, propiedad: string = 'nombre'): string {
    // Paso 1: Verificación de entradas simples
    if (!listaDeItems || idABuscar === 0 || listaDeItems.length === 0) {
      return 'Dato no disponible (ID 0 o lista vacía)';
    }

    // Paso 2: Usamos el método find() para buscar el elemento con el ID coincidente.
    // Esto es muy claro y fácil de entender.
    const elementoEncontrado = listaDeItems.find(item => {
      return item.id === idABuscar; // Comparación sencilla y estricta
    });

    // Paso 3: Retornar el resultado
    if (elementoEncontrado) {
      // Devolvemos el nombre de la propiedad solicitada (generalmente 'nombre').
      return (elementoEncontrado as any)[propiedad] || 'Nombre no definido';
    } else {
      // Si no se encuentra, devolvemos un mensaje de error claro para depuración.
      return `ID no encontrado (${idABuscar})`;
    }
  }
}
