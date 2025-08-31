import { api, authToken, expect } from 'test/setup'

describe('Permission Mutation Tests', () => {
  let createdPermissionId

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

    it('should create permission successfully', async () => {
      const response = await api.post(
        '/permissions',
        { action: 'read', module: 'user' },
        { headers: { Authorization: authToken } }
      )
      const { data } = response?.data || {}

      expect(response.status).to.equal(201)
      expect(data).to.have.property('id')
      expect(data.action).to.equal('read')
      expect(data.module).to.equal('user')
      createdPermissionId = data.id
    })
  })

  describe('PUT /permissions/:id', () => {
    it('should return 401 for missing token', async () => {
      try {
        await api.put('/permissions/1', { action: 'create', module: 'user' })
      } catch (error) {
        expect(error.response.status).to.equal(401)
      }
    })

    it('should update permission successfully', async () => {
      const response = await api.put(
        `/permissions/${createdPermissionId}`,
        { action: 'create', module: 'user' },
        { headers: { Authorization: authToken } }
      )
      const { data } = response?.data || {}

      expect(response.status).to.equal(200)
      expect(data?.action).to.equal('create')
      expect(data?.module).to.equal('user')
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

    it('should delete permission successfully', async () => {
      const response = await api.delete(`/permissions/${createdPermissionId}`, {
        headers: { Authorization: authToken }
      })

      expect(response.status).to.equal(200)
    })
  })
})
