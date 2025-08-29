import { api, expect } from 'test/setup'

describe('Permission Query Tests', () => {
  describe('GET /permissions', () => {
    it('should return 401 for missing token', async () => {
      try {
        await api.get('/permissions')
      } catch (error) {
        expect(error.response.status).to.equal(401)
      }
    })
  })

  describe('GET /permissions/:id', () => {
    it('should return 401 for missing token', async () => {
      try {
        await api.get('/permissions/1')
      } catch (error) {
        expect(error.response.status).to.equal(401)
      }
    })
  })
})
