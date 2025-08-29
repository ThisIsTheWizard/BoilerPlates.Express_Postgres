import axios from 'axios'
import { expect } from 'chai'

const api = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 5000
})

export { api, expect }
