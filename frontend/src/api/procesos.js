import client from './client'

export const crearProceso = async (datos) => {
  const response = await client.post('/procesos', datos)
  return response.data
}

export const obtenerProceso = async (id) => {
  const response = await client.get(`/procesos/${id}`)
  return response.data
}
