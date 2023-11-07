import axios from 'axios'

import { RUNN_API_BASE_URL, RUNN_API_TOKEN } from 'src/constants.js'

export const API_CONFIG = {
  headers: {
    accept: 'application/json',
    'accept-version': '1.0.0',
    Authorization: `Bearer ${RUNN_API_TOKEN}`,
  },
}

const apiClient = axios.create({
  baseURL: RUNN_API_BASE_URL,
  headers: API_CONFIG.headers,
})

export const api = async (endpoint: string, params = {}) => {
  try {
    const response = await apiClient.get(endpoint, { params })
    return response.data
  } catch (error) {
    console.error(`Error fetching data from ${endpoint}:`, error)
    throw error
  }
}
