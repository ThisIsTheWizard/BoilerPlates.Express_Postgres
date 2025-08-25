import { Router } from 'express'

// Controllers
import { userController } from 'src/modules/controllers'

// Middlewares
import { authorizer } from 'src/middlewares'

export const userRouter = Router()

userRouter.post('/register', userController.registerUser)

userRouter.post('/verify-user-email', userController.verifyUserEmail)

userRouter.post('/resend-verification-email', userController.resendVerificationEmail)

userRouter.post('/login', userController.loginUser)

userRouter.post('/refresh-token', userController.getRefreshedTokens)

userRouter.get('/user', authorizer(), userController.getAuthUser)

userRouter.post('/logout', authorizer(), userController.logoutUser)

userRouter.post('/change-email', authorizer(), userController.changeEmail)

userRouter.post('/cancel-change-email', authorizer(), userController.cancelChangeEmail)

userRouter.post('/verify-change-email', authorizer(), userController.verifyNewEmail)

userRouter.post('/set-user-email', authorizer(['admin']), userController.setUserEmailByAdmin)

userRouter.post('/change-password', authorizer(), userController.changePassword)

userRouter.post('/set-user-password', authorizer(['admin']), userController.setUserPasswordByAdmin)

userRouter.post('/forgot-password', userController.tryForgotPassword)

userRouter.post('/retry-forgot-password', userController.retryForgotPassword)

userRouter.post('/verify-forgot-password', userController.verifyForgotPassword)

userRouter.post('/verify-forgot-password-code', userController.verifyForgotPasswordCode)

userRouter.post('/verify-user-password', authorizer(), userController.verifyUserPassword)
