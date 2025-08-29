import { api, expect } from 'test/setup'

describe('Role-Permission Query Tests', () => {
  describe('GET /role-permissions', () => {
    it('should return 401 for missing token', async () => {
      try {
        await api.get('/role-permissions')
      } catch (error) {
        expect(error.response.status).to.equal(401)
      }
    })
  })

  describe('GET /role-permissions/:id', () => {
    it('should return 401 for missing token', async () => {
      try {
        await api.get('/role-permissions/1')
      } catch (error) {
        expect(error.response.status).to.equal(401)
      }
    })
  })
})
