import client from './client'
export const evaluarProceso = async (datos) => {
  const response = await client.post('/evaluate', datos)
  return response.data
}
