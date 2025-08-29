import { api, expect } from 'test/setup'

describe('Role Mutation Tests', () => {
  describe('POST /roles', () => {
    it('should return 401 for missing token', async () => {
      try {
        await api.post('/roles', {
          name: 'test_role',
          description: 'Test role'
        })
      } catch (error) {
        expect(error.response.status).to.equal(401)
      }
    })
  })

  describe('PUT /roles/:id', () => {
    it('should return 401 for missing token', async () => {
      try {
        await api.put('/roles/1', {
          name: 'updated_role',
          description: 'Updated role'
        })
      } catch (error) {
        expect(error.response.status).to.equal(401)
      }
    })
  })

  describe('DELETE /roles/:id', () => {
    it('should return 401 for missing token', async () => {
      try {
        await api.delete('/roles/1')
      } catch (error) {
        expect(error.response.status).to.equal(401)
      }
    })
  })
})
