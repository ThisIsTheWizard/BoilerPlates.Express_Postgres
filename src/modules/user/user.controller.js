// Services
import { userService } from 'src/modules/services'

// Utils
import { useTransaction } from 'src/utils/database'
import { CustomError } from 'src/utils/error'

export const userController = {}

userController.registerUser = async (req, res, next) => {
  try {
    const data = await useTransaction(async (transaction) => userService.registerUser(req.body, transaction))

    res.status(200).json({ data, message: 'SUCCESS' })
  } catch (err) {
    next(err)
  }
}

userController.verifyUserEmail = async (req, res, next) => {
  try {
    const data = await useTransaction(async (transaction) => await userService.verifyUserEmail(req.body, transaction))

    res.status(200).json({ data, message: 'SUCCESS' })
  } catch (err) {
    next(err)
  }
}

userController.resendVerificationEmail = async (req, res, next) => {
  try {
    const data = await useTransaction(async (transaction) =>
      userService.resendUserVerificationEmail(req.body, transaction)
    )

    res.status(200).json({ data, message: 'SUCCESS' })
  } catch (err) {
    next(err)
  }
}

userController.loginUser = async (req, res, next) => {
  try {
    const data = await useTransaction(async (transaction) => userService.loginUser(req.body, transaction))

    res.status(200).json({ data, message: 'SUCCESS' })
  } catch (err) {
    next(err)
  }
}

userController.getRefreshedTokens = async (req, res, next) => {
  try {
    const data = await useTransaction(async (transaction) => userService.refreshTokensForUser(req.body, transaction))

    res.status(200).json({ data, message: 'SUCCESS' })
  } catch (err) {
    next(err)
  }
}

userController.getAuthUser = async (req, res, next) => {
  try {
    if (!req?.user?.user_id) {
      throw new CustomError(401, 'UNAUTHORIZED')
    }

    res.status(200).json({ data: req.user, message: 'SUCCESS' })
  } catch (err) {
    next(err)
  }
}

userController.logoutUser = async (req, res, next) => {
  try {
    await useTransaction(async (transaction) =>
      userService.logoutUser(req.headers?.authorization, req?.user, transaction)
    )

    res.status(200).json({ data: { success: true }, message: 'Successfully logged out!' })
  } catch (err) {
    next(err)
  }
}

userController.changeEmail = async (req, res, next) => {
  try {
    await useTransaction(async (transaction) => userService.changeEmail(req?.body, req?.user, transaction))

    res.status(200).json({ data: { success: true }, message: 'Email changed successfully' })
  } catch (err) {
    next(err)
  }
}

userController.cancelChangeEmail = async (req, res, next) => {
  try {
    await useTransaction(async (transaction) => userService.cancelChangeEmail(req?.user, transaction))

    res.status(200).json({ data: { success: true }, message: 'Email changed successfully' })
  } catch (err) {
    next(err)
  }
}

userController.verifyNewEmail = async (req, res, next) => {
  try {
    await useTransaction(async (transaction) => userService.verifyNewEmail(req?.body, req?.user, transaction))

    res.status(200).json({ data: { success: true }, message: 'Email confirmed successfully' })
  } catch (err) {
    next(err)
  }
}

userController.setUserEmailByAdmin = async (req, res, next) => {
  try {
    await useTransaction(async (transaction) => userService.setUserEmailByAdmin(req?.body, req.user, transaction))

    res.status(200).json({ data: { success: true }, message: 'Email changed successfully' })
  } catch (err) {
    next(err)
  }
}

userController.changePassword = async (req, res, next) => {
  try {
    const { body = {}, user } = req || {}
    await useTransaction(async (transaction) => userService.changePassword(body, user, transaction))

    res.status(200).json({ data: { success: true }, message: 'Successfully changed password!' })
  } catch (err) {
    next(err)
  }
}

userController.setUserPasswordByAdmin = async (req, res, next) => {
  try {
    await useTransaction(async (transaction) => userService.setUserPasswordByAdmin(req.body, transaction))

    res.status(200).json({ data: { success: true }, message: 'Successfully set user password!' })
  } catch (err) {
    next(err)
  }
}

userController.tryForgotPassword = async (req, res, next) => {
  try {
    await useTransaction(async (transaction) => userService.tryForgotPassword(req?.body, transaction))

    res.status(200).json({ data: { success: true }, message: 'Successfully sent verification email!' })
  } catch (err) {
    next(err)
  }
}

userController.retryForgotPassword = async (req, res, next) => {
  try {
    const data = await useTransaction(async (transaction) => userService.retryForgotPassword(req?.body, transaction))

    res.status(200).json({ data, message: 'SUCCESS' })
  } catch (err) {
    next(err)
  }
}

userController.verifyForgotPassword = async (req, res, next) => {
  try {
    await useTransaction(async (transaction) => userService.verifyForgotPassword(req?.body, transaction))

    res.status(200).json({ data: { success: true }, message: 'Successfully reset new password!' })
  } catch (err) {
    next(err)
  }
}

userController.verifyForgotPasswordCode = async (req, res, next) => {
  try {
    await useTransaction(async (transaction) => userService.verifyForgotPasswordCode(req?.body, transaction))

    res.status(200).json({ data: { success: true }, message: 'Successfully verified password reset code!' })
  } catch (err) {
    next(err)
  }
}

userController.verifyUserPassword = async (req, res, next) => {
  try {
    const data = await useTransaction(async (transaction) =>
      userService.verifyUserPassword(req?.body, req?.user, transaction)
    )

    res.status(200).json({ data, message: 'Successfully verified password!' })
  } catch (err) {
    next(err)
  }
}
