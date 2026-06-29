import axios from 'axios'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  timeout: 10000,
})

client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (!err.response && err.request) {
      return Promise.reject(new Error('network'))
    }
    return Promise.reject(err)
  }
)

export default client
