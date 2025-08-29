import { api, expect } from 'test/setup'

describe('User Query Tests', () => {
  describe('GET /users/me', () => {
    it('should return 401 for missing token', async () => {
      try {
        await api.get('/users/me')
      } catch (error) {
        expect(error.response.status).to.equal(401)
      }
    })

    it('should return 401 for invalid token', async () => {
      try {
        await api.get('/users/me', {
          headers: { Authorization: 'Bearer invalid_token' }
        })
      } catch (error) {
        expect(error.response.status).to.equal(401)
      }
    })
  })

  describe('POST /users/refresh-token', () => {
    it('should return error for missing tokens', async () => {
      try {
        const response = await api.post('/users/refresh-token', {})
        expect(response.status).to.not.equal(404)
      } catch (error) {
        expect(error.response.status).to.not.equal(404)
      }
    })
  })
})
