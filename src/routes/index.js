import { Router } from 'express'

// Routers
import {
  docRouter,
  permissionRouter,
  rolePermissionRouter,
  roleRouter,
  roleUserRouter,
  userRouter
} from 'src/modules/routers'

// Utils
import { startDBSetupForTesting } from 'src/utils/seed'

const router = Router()

router.use('/docs', docRouter)

router.use('/permissions', permissionRouter)

router.use('/role-permissions', rolePermissionRouter)

router.use('/role-users', roleUserRouter)

router.use('/roles', roleRouter)

router.use('/users', userRouter)

// Test
router.post('/test/setup', startDBSetupForTesting)

export default router
