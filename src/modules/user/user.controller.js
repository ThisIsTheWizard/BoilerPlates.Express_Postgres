// Initiating Dot Env
require('dotenv').config()

import { omit } from 'lodash'

// Helpers
import {
  commonHelper,
  organizationBrandHelper,
  organizationHelper,
  userHelper,
  userSessionHelper
} from 'src/modules/helpers'

// Services
import { authService, organizationBrandService, userService } from 'src/modules/services'

// Utils
import { useTransaction } from 'src/utils/database'
import { CustomError } from 'src/utils/error'

export const userController = {}

userController.checkUserByEmail = async (req, res, next) => {
  try {
    if (!req?.query?.email) {
      throw new CustomError(400, 'MISSING_EMAIL')
    }
    const user = await userHelper.getAUser({ where: { email: req?.query?.email } })

    res.status(200).json({
      data: {
        is_user_exist: !!user?.id,
        is_verified: user?.status === 'active',
        has_password: !!user?.password,
        user_id: user?.id
      },
      message: 'Successfully fetched!'
    })
  } catch (err) {
    next(err)
  }
}

userController.registerAPortalUser = async (req, res, next) => {
  try {
    const data = await useTransaction(async (transaction) => userService.registerAPortalUser(req.body, transaction))

    res.status(200).json({ data, message: 'Successfully registered portal user!' })
  } catch (err) {
    next(err)
  }
}

userController.preRegisterAnUser = async (req, res, next) => {
  try {
    const data = await useTransaction(async (transaction) => userService.preRegisterAnUser(req.body, transaction))

    res.status(200).json({ data, message: 'Successfully pre-registered!' })
  } catch (err) {
    next(err)
  }
}

userController.registerAnUser = async (req, res, next) => {
  try {
    const data = await useTransaction(async (transaction) => userService.registerAnUser(req.body, transaction))

    res.status(200).json({ data, message: 'Successfully registered!' })
  } catch (err) {
    next(err)
  }
}

userController.verifyEmailForAnUser = async (req, res, next) => {
  try {
    const user = await useTransaction(
      async (transaction) => await userService.verifyEmailForAnUser(req.body, transaction)
    )

    res.status(200).json({ data: { success: true, user }, message: 'Successfully verified user email!' })
  } catch (err) {
    next(err)
  }
}

userController.resendVerificationEmailForAnUser = async (req, res, next) => {
  try {
    await useTransaction(async (transaction) => authService.resendVerificationToken(req.body, transaction))

    res.status(200).json({ data: { success: true }, message: 'Successfully resent verification email!' })
  } catch (err) {
    next(err)
  }
}

userController.loginAnAdminUser = async (req, res, next) => {
  try {
    const data = await useTransaction(async (transaction) => userService.loginAnAdminUser(req.body, transaction))

    res.status(200).json({ data, message: 'Successfully logged in as admin!' })
  } catch (err) {
    next(err)
  }
}

userController.loginAnUser = async (req, res, next) => {
  try {
    const { hostname = '' } = commonHelper.prepareURLObjectFromString(req?.headers?.origin)
    if (hostname?.includes?.('easydesk')) {
      req.body.is_from_web = true
    }

    const data = await useTransaction(async (transaction) => userService.loginAnUser(req.body, transaction))

    res.status(200).json({ data, message: 'Successfully logged in!' })
  } catch (err) {
    next(err)
  }
}

userController.loginAPortalUser = async (req, res, next) => {
  try {
    const data = await useTransaction(async (transaction) => userService.loginAPortalUser(req.body, transaction))

    res.status(200).json({ data: data?.message ? {} : data, message: data?.message || 'Successfully logged in!' })
  } catch (err) {
    next(err)
  }
}

userController.getRefreshedTokensForAnUser = async (req, res, next) => {
  try {
    const { hostname = '' } = commonHelper.prepareURLObjectFromString(req?.headers?.origin)
    if (hostname?.includes?.('easydesk')) {
      req.body.is_from_web = true
    }

    const data = await useTransaction(async (transaction) =>
      userService.getRefreshedTokensForAnUser(req.body, transaction)
    )

    res.status(200).json({ data, message: 'Successfully refreshed tokens!' })
  } catch (err) {
    next(err)
  }
}

userController.getAuthUser = async (req, res, next) => {
  try {
    if (!req?.user?.user_id) {
      throw new CustomError(400, 'UNAUTHORIZED_USER')
    }

    res.status(200).json({
      data: omit(req.user, ['created_at', 'has_temp_password', 'old_passwords', 'password', 'updated_at']),
      message: 'Successfully fetched user!'
    })
  } catch (err) {
    next(err)
  }
}

userController.getAUserSession = async (req, res, next) => {
  try {
    const data = await userSessionHelper.getAUserSession({
      where: { id: req?.body?.session_id, org_id: req?.body?.org_id }
    })

    res.status(200).json({ data, message: 'Successfully fetched user session!' })
  } catch (err) {
    next(err)
  }
}

userController.logoutAnUser = async (req, res, next) => {
  try {
    await useTransaction(async (transaction) =>
      userService.logoutAnUser(req.headers?.authorization, req?.user, transaction)
    )

    res.status(200).json({ data: { success: true }, message: 'Successfully logged out!' })
  } catch (err) {
    next(err)
  }
}

userController.changeEmailOfAnUser = async (req, res, next) => {
  try {
    await useTransaction(async (transaction) => userService.changeEmailOfAnUser(req?.body, req?.user, transaction))

    res.status(200).json({ data: { success: true }, message: 'Email changed successfully' })
  } catch (err) {
    next(err)
  }
}

userController.cancelChangeEmailOfAnUser = async (req, res, next) => {
  try {
    await useTransaction(async (transaction) => userService.cancelChangeEmailOfAnUser(req?.user, transaction))

    res.status(200).json({ data: { success: true }, message: 'Email changed successfully' })
  } catch (err) {
    next(err)
  }
}

userController.verifyNewEmailOfAnUser = async (req, res, next) => {
  try {
    await useTransaction(async (transaction) => userService.verifyNewEmailOfAnUser(req?.body, req?.user, transaction))

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

userController.changePasswordOfAnUser = async (req, res, next) => {
  try {
    const { body = {}, user } = req || {}
    await useTransaction(async (transaction) => userService.changePasswordOfAnUser(body, user, transaction))

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

userController.tryForgotPasswordForAnUser = async (req, res, next) => {
  try {
    await useTransaction(async (transaction) => userService.tryForgotPasswordForAnUser(req?.body, transaction))

    res.status(200).json({ data: { success: true }, message: 'Successfully sent verification email!' })
  } catch (err) {
    next(err)
  }
}

userController.retryForgotPasswordOfAnUser = async (req, res, next) => {
  try {
    const { body = {} } = req
    commonHelper.checkRequiredFields(['email'], body)

    const { email } = body
    if (!commonHelper.validateEmail(email)) {
      throw new CustomError(400, 'PLEASE_PROVIDE_CORRECT_EMAIL')
    }

    await useTransaction(async (transaction) => {
      const user = await userHelper.getAUser({ where: { email } }, transaction)
      if (!user.id) {
        throw new CustomError(404, 'USER_DOES_NOT_EXIST')
      }

      return authService.retryForgotPassword({ email }, transaction)
    })

    res.status(200).json({
      message: 'A password reset code is sent to your email',
      success: true
    })
  } catch (err) {
    next(err)
  }
}

userController.verifyForgotPasswordForAnUser = async (req, res, next) => {
  try {
    await useTransaction(async (transaction) => userService.verifyForgotPasswordForAnUser(req?.body, transaction))

    res.status(200).json({ data: { success: true }, message: 'Successfully reset new password!' })
  } catch (err) {
    next(err)
  }
}

userController.verifyForgotPasswordCodeForAnUser = async (req, res, next) => {
  try {
    await useTransaction(async (transaction) => userService.verifyForgotPasswordCodeForAnUser(req?.body, transaction))

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

userController.validateUserSession = async (req, res, next) => {
  try {
    const data = await useTransaction(async (transaction) =>
      userService.validateUserSession(
        { sub_domain: commonHelper.getOrgSubDomainFromRequest(req), ...req?.body },
        transaction
      )
    )

    res.status(200).json({ data, message: 'Successfully validated user!' })
  } catch (err) {
    next(err)
  }
}

userController.loginAnApplication = async (req, res, next) => {
  try {
    if (!req?.body?.org_brand_id && req?.body?.org_id) {
      if (!commonHelper.validateUUID(req?.body?.org_id)) throw new CustomError(400, 'INVALID_ORG_ID')

      const organization = await organizationHelper.getAnOrganization({ where: { id: req?.body?.org_id } })
      if (!organization?.id) throw new CustomError(404, 'ORGANIZATION_NOT_FOUND')
    } else if (req?.body?.org_brand_id && req?.body?.org_id) {
      if (!commonHelper.validateUUID(req?.body?.org_brand_id)) throw new CustomError(400, 'INVALID_ORG_BRAND_ID')

      const organizationBrand = await organizationBrandHelper.getAnOrganizationBrand({
        where: { id: req?.body?.org_brand_id, org_id: req?.body?.org_id }
      })
      if (!organizationBrand?.id) throw new CustomError(404, 'ORGANIZATION_BRAND_NOT_FOUND')
    } else if (req?.body?.org_brand_id) {
      throw new CustomError(400, 'MISSING_ORG_ID')
    }

    const data = await useTransaction(async (transaction) => authService.loginAnApplication(req?.body, transaction))

    res.status(200).json({ data, message: 'Successfully logged in!' })
  } catch (err) {
    next(err)
  }
}

userController.loginWidget = async (req, res, next) => {
  try {
    if (!req?.body?.api_key) throw new CustomError(400, 'MISSING_API_KEY')

    const data = await useTransaction(async (transaction) =>
      organizationBrandService.verifyAndLoginForWidget(req?.body, transaction)
    )

    res.status(200).json({ data, message: 'Successfully logged in!' })
  } catch (err) {
    next(err)
  }
}
