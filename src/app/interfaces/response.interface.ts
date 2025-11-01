export interface ResponseDTO<T> {
  status?: string,
  // ¡CORRECCIÓN CLAVE! 
  // Cambiar T[] (array) por T (objeto único)
  data: T, 
  message: string
}