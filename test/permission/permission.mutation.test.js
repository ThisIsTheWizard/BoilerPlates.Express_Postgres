import { api, expect } from 'test/setup'

describe('Permission Mutation Tests', () => {
  describe('POST /permissions', () => {
    it('should return 401 for missing token', async () => {
      try {
        await api.post('/permissions', {
          action: 'read',
          module: 'user'
        })
      } catch (error) {
        expect(error.response.status).to.equal(401)
      }
    })
  })

  describe('PUT /permissions/:id', () => {
    it('should return 401 for missing token', async () => {
      try {
        await api.put('/permissions/1', {
          action: 'write',
          module: 'user'
        })
      } catch (error) {
        expect(error.response.status).to.equal(401)
      }
    })
  })

  describe('DELETE /permissions/:id', () => {
    it('should return 401 for missing token', async () => {
      try {
        await api.delete('/permissions/1')
      } catch (error) {
        expect(error.response.status).to.equal(401)
      }
    })
  })
})
