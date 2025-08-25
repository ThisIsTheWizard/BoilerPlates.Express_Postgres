import { Router } from 'express'

// Controllers
import { permissionController } from 'src/modules/controllers'

// Middlewares
import { authorizer } from 'src/middlewares'

export const permissionRouter = Router()

permissionRouter.post('/permissions', authorizer(), permissionController.createAPermission)

permissionRouter.put('/permissions/:entity_id', authorizer(), permissionController.updateAPermission)

permissionRouter.delete('/permissions/:entity_id', authorizer(), permissionController.deleteAPermission)

permissionRouter.get('/permissions', authorizer(), permissionController.getPermissions)

permissionRouter.get('/permissions/:entity_id', authorizer(), permissionController.getAPermission)
