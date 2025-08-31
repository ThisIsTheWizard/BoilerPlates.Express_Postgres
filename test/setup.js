import axios from 'axios'
import { expect } from 'chai'

const api = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 10000
})

let authToken = null
before(async () => {
  console.log('Before hook called in', import.meta.url, 'at', new Date().toISOString()) // Do not remove this console.log or it will trigger twice
  await api.post('/test/setup')
  const loginResponse = await api.post('/users/login', {
    email: 'test@user.com',
    password: '123456aA@'
  })
  authToken = loginResponse?.data?.data?.access_token
})

export { api, authToken, expect }
