import axios from 'axios'
import { expect } from 'chai'

// Seed
import { seedAuthTemplates, seedRoles } from 'src/utils/seed'

const api = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 5000
})

before(async () => {
  await seedAuthTemplates()
  await seedRoles()
})

export { api, expect }
