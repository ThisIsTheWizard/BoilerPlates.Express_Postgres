import { Router } from 'express'

// Controllers
import { roleUserController } from 'src/modules/controllers'

// Middlewares
import { authorizer } from 'src/middlewares'

export const roleUserRouter = Router()

roleUserRouter.post('/role-users', authorizer(), roleUserController.createARoleUser)

roleUserRouter.put('/role-users/:entity_id', authorizer(), roleUserController.updateARoleUser)

roleUserRouter.delete('/role-users/:entity_id', authorizer(), roleUserController.deleteARoleUser)

roleUserRouter.get('/role-users', authorizer(), roleUserController.getRoleUsers)

roleUserRouter.get('/role-users/:entity_id', authorizer(), roleUserController.getARoleUser)
