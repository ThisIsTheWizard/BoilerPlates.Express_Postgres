// Entities
import { AuthTokenEntity } from 'src/modules/entities'

// Helpers
import { authTokenHelper } from 'src/modules/helpers'

// Utils
import { CustomError } from 'src/utils/error'

export const createAnAuthToken = async (data, options, transaction) =>
  AuthTokenEntity.create(data, { ...options, transaction })

export const updateAnAuthToken = async (options, data, transaction) => {
  const authToken = await authTokenHelper.getAnAuthToken(options, transaction)
  if (!authToken?.id) {
    throw new CustomError(404, 'AUTH_TOKEN_NOT_FOUND')
  }

  await authToken.update(data, { transaction })

  return authToken
}

export const deleteAnAuthToken = async (options, transaction) => {
  const authToken = await authTokenHelper.getAnAuthToken(options, transaction)
  if (!authToken?.id) {
    throw new CustomError(404, 'AUTH_TOKEN_NOT_FOUND')
  }

  await authToken.destroy({ transaction })

  return authToken
}

export const createAuthTokensForUser = async (sequelize, user, transaction) => {
  const { id: user_id, org_brand_id, org_id, roles } = user || {}

  const accessTokenExpiry = process.env.ACCESS_TOKEN_EXPIRY || '1d'
  const refreshTokenExpiry = process.env.REFRESH_TOKEN_EXPIRY || '30d'

  const access_token = generateJWTToken(
    { org_brand_id, org_id, roles, sub: user?.app_user_id, user_id },
    accessTokenExpiry
  )
  const refresh_token = generateJWTToken({ sub: user?.app_user_id, user_id }, refreshTokenExpiry)

  const authToken = await createAnAuthToken(sequelize, { access_token, refresh_token, user_id }, transaction)
  if (!authToken?.id) {
    throw new Error('COULD_NOT_CREATE_AUTH_TOKEN')
  }

  return { access_token, refresh_token }
}

export const verifyAnAuthTokenForUser = async (sequelize, params = {}) => {
  validateProps(
    [
      { field: 'token', required: true, type: 'string' },
      { field: 'type', required: true, type: 'string' }
    ],
    params
  )

  const { token, type } = params || {}
  if (!['access_token', 'refresh_token'].includes(type)) {
    throw new Error('TOKEN_TYPE_IS_INVALID')
  }

  const { user_id } = decodeJWTToken(token) || {}
  const authToken = await readAnAuthToken(sequelize, {
    where: { [type]: token, user_id }
  })
  if (!authToken?.id) {
    return { message: 'INVALID_TOKEN', success: false }
  }

  return verifyJWTToken(token) || {}
}

export const refreshAuthTokensForUser = async (sequelize, params = {}, transaction) => {
  validateProps(
    [
      { field: 'custom_claims', required: true, type: 'object' },
      { field: 'refresh_token', required: true, type: 'string' }
    ],
    params
  )
  validateProps(
    [
      { field: 'org_brand_id', required: false, type: 'string' },
      { field: 'org_id', required: false, type: 'string' },
      { field: 'roles', required: true, type: 'object' },
      { field: 'user_id', required: true, type: 'string' }
    ],
    params?.custom_claims || {}
  )

  const { custom_claims, refresh_token } = params || {}

  const { user_id } = decodeJWTToken(refresh_token) || {}
  const authToken = await readAnAuthToken(
    sequelize,
    { include: [{ association: 'user' }], where: { refresh_token, user_id } },
    transaction
  )
  if (!authToken?.id) {
    throw new Error('REFRESH_TOKEN_IS_INVALID')
  }

  const { user } = authToken || {}
  if (!user?.id) {
    throw new Error('USER_IS_NOT_FOUND')
  }
  if (!(user?.status === 'active')) {
    throw new Error('USER_IS_NOT_ACTIVE')
  }

  await authToken.destroy({ transaction })

  return createAuthTokensForUser(sequelize, { ...user?.dataValues, ...custom_claims }, transaction)
}

export const revokeAnAuthTokenForUser = async (sequelize, params = {}, transaction) => {
  validateProps(
    [
      { field: 'token', required: true, type: 'string' },
      { field: 'type', required: true, type: 'string' }
    ],
    params
  )

  const { token, type } = params || {}
  if (!['access_token', 'refresh_token'].includes(type)) {
    throw new Error('TOKEN_TYPE_IS_INVALID')
  }

  const deletedCount = await deleteAuthTokensForUser(sequelize, { where: { [type]: token } }, transaction)
  if (deletedCount <= 0) {
    return { message: 'INVALID_TOKEN', success: false }
  }

  return { message: 'LOGGED_OUT', success: true }
}

export const revokeAuthTokensForUser = async (sequelize, params = {}, transaction) => {
  validateProps([{ field: 'user_id', required: true, type: 'string' }], params)

  const { user_id } = params || {}
  const user = await getAUser(sequelize, { where: { id: user_id } }, transaction)
  if (!user?.id) {
    throw new Error('USER_IS_NOT_FOUND')
  }
  if (!(user?.status === 'active')) {
    throw new Error('USER_IS_NOT_ACTIVE')
  }

  const deletedCount = await deleteAuthTokensForUser(sequelize, { where: { user_id } }, transaction)
  if (deletedCount <= 0) {
    return { message: 'INVALID_TOKEN', success: false }
  }

  return { message: 'LOGGED_OUT', success: true }
}
