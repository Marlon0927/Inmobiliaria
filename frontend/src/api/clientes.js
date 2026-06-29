import client from './client'
export const crearCliente = async (datos) => {
  const response = await client.post('/clientes', datos)
  return response.data
}
