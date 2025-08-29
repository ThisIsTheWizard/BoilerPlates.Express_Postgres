import { api, expect } from 'test/setup'

describe('Role-User Mutation Tests', () => {
  describe('POST /role-users', () => {
    it('should return 401 for missing token', async () => {
      try {
        await api.post('/role-users', {
          role_id: 1,
          user_id: 1
        })
      } catch (error) {
        expect(error.response.status).to.equal(401)
      }
    })
  })

  describe('PUT /role-users/:id', () => {
    it('should return 401 for missing token', async () => {
      try {
        await api.put('/role-users/1', {
          role_id: 2,
          user_id: 2
        })
      } catch (error) {
        expect(error.response.status).to.equal(401)
      }
    })
  })

  describe('DELETE /role-users/:id', () => {
    it('should return 401 for missing token', async () => {
      try {
        await api.delete('/role-users/1')
      } catch (error) {
        expect(error.response.status).to.equal(401)
      }
    })
  })
})
