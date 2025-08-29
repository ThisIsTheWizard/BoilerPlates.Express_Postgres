import { api, expect } from 'test/setup'

describe('User Mutation Tests', () => {
  describe('POST /users/register', () => {
    it('should validate registration endpoint exists', async () => {
      try {
        const response = await api.post('/users/register', {
          email: 'test@example.com',
          password: 'Test123!@#',
          first_name: 'Test',
          last_name: 'User'
        })
        expect(response.status).to.not.equal(404)
      } catch (error) {
        expect(error.response.status).to.not.equal(404)
      }
    })
  })

  describe('POST /users/login', () => {
    it('should validate login endpoint exists', async () => {
      try {
        const response = await api.post('/users/login', {
          email: 'test@example.com',
          password: 'Test123!@#'
        })
        expect(response.status).to.not.equal(404)
      } catch (error) {
        expect(error.response.status).to.not.equal(404)
      }
    })
  })

  describe('POST /users/logout', () => {
    it('should return 401 for missing token', async () => {
      try {
        await api.post('/users/logout')
      } catch (error) {
        expect(error.response.status).to.equal(401)
      }
    })
  })

  describe('POST /users/change-password', () => {
    it('should return 401 for missing token', async () => {
      try {
        await api.post('/users/change-password', {
          old_password: 'old123',
          new_password: 'new123'
        })
      } catch (error) {
        expect(error.response.status).to.equal(401)
      }
    })
  })

  describe('POST /users/forgot-password', () => {
    it('should validate endpoint exists', async () => {
      try {
        const response = await api.post('/users/forgot-password', {
          email: 'test@example.com'
        })
        expect(response.status).to.not.equal(404)
      } catch (error) {
        expect(error.response.status).to.not.equal(404)
      }
    })
  })
})
