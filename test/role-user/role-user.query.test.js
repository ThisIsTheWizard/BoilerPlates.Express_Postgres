import { api, expect } from 'test/setup'

describe('Role-User Query Tests', () => {
  describe('GET /role-users', () => {
    it('should return 401 for missing token', async () => {
      try {
        await api.get('/role-users')
      } catch (error) {
        expect(error.response.status).to.equal(401)
      }
    })
  })

  describe('GET /role-users/:id', () => {
    it('should return 401 for missing token', async () => {
      try {
        await api.get('/role-users/1')
      } catch (error) {
        expect(error.response.status).to.equal(401)
      }
    })
  })
})
