import { Router } from 'express'

// Controllers
import { roleController } from 'src/modules/controllers'

// Middlewares
import { authorizer } from 'src/middlewares'

export const roleRouter = Router()

roleRouter.post('/roles', authorizer(), roleController.createARole)

roleRouter.put('/roles/:entity_id', authorizer(), roleController.updateARole)

roleRouter.delete('/roles/:entity_id', authorizer(), roleController.deleteARole)

roleRouter.get('/roles', authorizer(), roleController.getRoles)

roleRouter.get('/roles/:entity_id', authorizer(), roleController.getARole)
