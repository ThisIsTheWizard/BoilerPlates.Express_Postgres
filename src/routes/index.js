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

const router = Router()

router.use('/docs', docRouter)

router.use('/permissions', permissionRouter)

router.use('/role-permissions', rolePermissionRouter)

router.use('/role-users', roleUserRouter)

router.use('/roles', roleRouter)

router.use('/users', userRouter)

export default router
