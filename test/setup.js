import axios from 'axios'
import { expect } from 'chai'

const api = axios.create({
  baseURL: `http://localhost:${process.env.PORT || 8000}`,
  timeout: 10000
})

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const waitForServer = async () => {
  let lastError

  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      await api.get('/')
      return
    } catch (error) {
      lastError = error
      await wait(500)
    }
  }

  throw lastError || new Error('SERVER_IS_NOT_READY')
}

let authToken = null

const loginAndGetTokens = async ({ email, password }) => {
  const response = await api.post('/users/login', { email, password })
  return response?.data?.data
}

before(async () => {
  console.log('Before hook called in', import.meta.url, 'at', new Date().toISOString())
  await waitForServer()
  await api.post('/test/setup')
  const tokens = await loginAndGetTokens({ email: 'test@user.com', password: '123456aA@' })
  authToken = tokens?.access_token
})

export { api, authToken, expect, loginAndGetTokens }
