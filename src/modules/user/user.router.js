import { Router } from 'express'

// Middlewares
import { authorizer } from 'src/midllewares'

// Controllers
import { userController } from 'src/modules/controllers'

export const userRouter = Router()

userRouter.get('/check-user', userController.checkUserByEmail)

userRouter.post('/portal-register', userController.registerAPortalUser)

userRouter.post('/pre-register', userController.preRegisterAnUser)

userRouter.post('/register', userController.registerAnUser)

userRouter.post('/verify', userController.verifyEmailForAnUser)

userRouter.post('/resend-verification', userController.resendVerificationEmailForAnUser)

userRouter.post('/login', userController.loginAnUser)

userRouter.post('/admin-login', userController.loginAnAdminUser)

userRouter.post('/portal-login', userController.loginAPortalUser)

userRouter.post('/refresh-token', userController.getRefreshedTokensForAnUser)

userRouter.get('/user', authorizer(), userController.getAuthUser)

userRouter.post('/user-session', userController.getAUserSession)

userRouter.post('/logout', authorizer(), userController.logoutAnUser)

userRouter.post('/change-email', authorizer(), userController.changeEmailOfAnUser)

userRouter.post('/cancel-change-email', authorizer(), userController.cancelChangeEmailOfAnUser)

userRouter.post('/verify-change-email', authorizer(), userController.verifyNewEmailOfAnUser)

userRouter.post(
  '/set-user-email',
  authorizer(['admin', 'org_owner', 'org_admin', 'org_group_manager', 'org_agent', 'org_collaborator']),
  userController.setUserEmailByAdmin
)

userRouter.post('/change-password', authorizer(), userController.changePasswordOfAnUser)

userRouter.post('/set-user-password', authorizer(['admin']), userController.setUserPasswordByAdmin)

userRouter.post('/forgot-password', userController.tryForgotPasswordForAnUser)

userRouter.post('/retry-forgot-password', userController.retryForgotPasswordOfAnUser)

userRouter.post('/verify-forgot-password', userController.verifyForgotPasswordForAnUser)

userRouter.post('/verify-forgot-password-code', userController.verifyForgotPasswordCodeForAnUser)

userRouter.post('/verify-user-password', authorizer(), userController.verifyUserPassword)

userRouter.post('/validate-user-session', userController.validateUserSession)

userRouter.post('/app-login', userController.loginAnApplication)

userRouter.post('/widget-login', userController.loginWidget)
