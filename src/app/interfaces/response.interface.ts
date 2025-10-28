export interface ResponseDTO<T> {
  status?: string,
  data: T[],
  message: string
}
