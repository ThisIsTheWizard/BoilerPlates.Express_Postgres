import { api, expect } from 'test/setup'

describe('Role Query Tests', () => {
  describe('GET /roles', () => {
    it('should return 401 for missing token', async () => {
      try {
        await api.get('/roles')
      } catch (error) {
        expect(error.response.status).to.equal(401)
      }
    })
  })

  describe('GET /roles/:id', () => {
    it('should return 401 for missing token', async () => {
      try {
        await api.get('/roles/1')
      } catch (error) {
        expect(error.response.status).to.equal(401)
      }
    })
  })
})
