import { api, expect } from 'test/setup'

describe('Role-Permission Mutation Tests', () => {
  describe('POST /role-permissions', () => {
    it('should return 401 for missing token', async () => {
      try {
        await api.post('/role-permissions', {
          role_id: 1,
          permission_id: 1
        })
      } catch (error) {
        expect(error.response.status).to.equal(401)
      }
    })
  })

  describe('PUT /role-permissions/:id', () => {
    it('should return 401 for missing token', async () => {
      try {
        await api.put('/role-permissions/1', {
          role_id: 2,
          permission_id: 2
        })
      } catch (error) {
        expect(error.response.status).to.equal(401)
      }
    })
  })

  describe('DELETE /role-permissions/:id', () => {
    it('should return 401 for missing token', async () => {
      try {
        await api.delete('/role-permissions/1')
      } catch (error) {
        expect(error.response.status).to.equal(401)
      }
    })
  })
})
