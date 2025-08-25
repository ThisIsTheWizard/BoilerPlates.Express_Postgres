import { Router } from 'express'

// Controllers
import { rolePermissionController } from 'src/modules/controllers'

// Middlewares
import { authorizer } from 'src/middlewares'

export const rolePermissionRouter = Router()

rolePermissionRouter.post('/role-permissions', authorizer(), rolePermissionController.createARolePermission)

rolePermissionRouter.put('/role-permissions/:entity_id', authorizer(), rolePermissionController.updateARolePermission)

rolePermissionRouter.delete(
  '/role-permissions/:entity_id',
  authorizer(),
  rolePermissionController.deleteARolePermission
)

rolePermissionRouter.get('/role-permissions', authorizer(), rolePermissionController.getRolePermissions)

rolePermissionRouter.get('/role-permissions/:entity_id', authorizer(), rolePermissionController.getARolePermission)
