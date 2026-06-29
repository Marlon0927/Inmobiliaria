import client from './client'
export const crearSolicitud = async (datos) => {
  const response = await client.post('/solicitudes', datos)
  return response.data
}
