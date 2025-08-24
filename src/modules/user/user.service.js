import { omit, size } from 'lodash'

// Entities
import { UserEntity } from 'src/modules/entities'

// Helpers

// Services

// Utils
import { CustomError } from 'src/utils/error'

export const createAUser = async (data, options, transaction) => UserEntity.create(data, { ...options, transaction })

export const updateAUser = async (options, data, transaction) => {
  const user = await UserEntity.findOne({ ...options, transaction })
  if (!user?.id) {
    throw new CustomError(404, 'USER_NOT_FOUND')
  }

  await user.update(data, { transaction })

  return user
}

export const deleteAUser = async (options, transaction) => {
  const user = await UserEntity.findOne({ ...options, transaction })
  if (!user?.id) {
    throw new CustomError(404, 'USER_NOT_FOUND')
  }

  await user.destroy({ transaction })

  return user
}

export const registerPassword = async (sequelize, params = {}, transaction) => {
  validateProps(
    [
      { field: 'is_verification_required', required: true, type: 'boolean' },
      { field: 'password', required: true, type: 'string' },
      { field: 'user_id', required: true, type: 'string' }
    ],
    params
  )

  const { is_verification_required = true, password, user_id } = params || {}
  if (is_verification_required && !checkPasswordPolicy(password)) {
    throw new Error('PASSWORD_DID_NOT_CONFORM_OUR_POLICY')
  }

  const user = await getAUser(sequelize, { where: { id: user_id } }, transaction)
  if (!user?.id) {
    throw new Error('USER_DOES_NOT_EXISTS')
  }

  const hashPassword = generateHashPassword(password)

  const updatingData = { password: hashPassword }
  if (is_verification_required) {
    updatingData.status = 'unverified'
  }

  await user.update(updatingData, { transaction })

  if (is_verification_required) {
    await createAVerificationTokenAndSendNotification(
      sequelize,
      { ...user?.dataValues, type: 'user_verification', user_id },
      transaction
    )
  }

  return omit(user?.dataValues, ['old_passwords', 'password'])
}

export const verifyUserEmail = async (sequelize, params = {}, transaction) => {
  validateProps(
    [
      { field: 'token', required: true, type: 'string' },
      { field: 'user_id', required: true, type: 'string' }
    ],
    params
  )

  const { token, user_id } = params || {}
  const verificationToken = await readAVerificationToken(
    sequelize,
    {
      where: {
        status: 'unverified',
        type: { [Op.in]: ['resend_user_verification', 'user_verification'] },
        token,
        user_id
      }
    },
    transaction
  )
  if (!verificationToken?.id) {
    throw new Error('OTP_IS_NOT_VALID')
  }
  if (moment(verificationToken?.expired_at).isBefore(moment())) {
    throw new Error('OTP_IS_EXPIRED')
  }

  await deleteVerificationTokens(
    sequelize,
    { where: { type: { [Op.in]: ['resend_user_verification', 'user_verification'] }, user_id } },
    transaction
  )

  const user = await getAUser(sequelize, { where: { id: user_id } }, transaction)
  if (!user?.id) {
    throw new Error('USER_IS_NOT_FOUND')
  }

  await user.update({ status: 'active' }, { transaction })

  return omit(user?.dataValues, ['old_passwords', 'password'])
}

export const resendUserVerificationEmail = async (sequelize, params = {}, transaction) => {
  validateProps([{ field: 'email', required: true, type: 'string' }], params)

  const { email } = params || {}
  const user = await getAUser(sequelize, { where: { [Op.or]: [{ email }, { new_email: email }] } }, transaction)
  if (!user?.id) {
    throw new Error('USER_IS_NOT_FOUND')
  }
  if (!(user?.status === 'unverified') && !user?.new_email) {
    throw new Error('USER_IS_ALREADY_VERIFIED')
  }

  const existingTokens = await readVerificationTokens(
    sequelize,
    {
      order: [['created_at', 'desc']],
      where: {
        created_at: { [Op.gte]: moment().subtract(10, 'minutes').toDate() },
        status: { [Op.in]: ['cancelled', 'unverified'] },
        type: 'resend_user_verification',
        user_id: user?.id
      }
    },
    transaction
  )
  if (size(existingTokens) >= 3) {
    throw new Error('TOO_MANY_RESEND_VERIFICATION_REQUESTS')
  }

  await updateVerificationTokens(
    sequelize,
    {
      data: { status: 'cancelled' },
      options: {
        where: {
          status: 'unverified',
          type: { [Op.in]: ['resend_user_verification', 'user_verification'] },
          user_id: user?.id
        }
      }
    },
    transaction
  )

  await createAVerificationTokenAndSendNotification(
    sequelize,
    { ...user?.dataValues, email, type: 'resend_user_verification', user_id: user?.id },
    transaction
  )

  return omit(user?.dataValues, ['old_passwords', 'password'])
}

export const loginAUser = async (sequelize, params = {}, transaction) => {
  validateProps(
    [
      { field: 'custom_claims', required: true, type: 'object' },
      { field: 'password', required: true, type: 'string' },
      { field: 'user_id', required: true, type: 'string' }
    ],
    params
  )
  validateProps(
    [
      { field: 'org_brand_id', required: false, type: 'string' },
      { field: 'org_id', required: false, type: 'string' },
      { field: 'roles', required: false, type: 'object' }
    ],
    params?.custom_claims || {}
  )

  const { custom_claims, password, user_id } = params || {}
  const user = await getAUser(sequelize, { where: { id: user_id } }, transaction)
  if (!user?.id) {
    throw new Error('USER_IS_NOT_FOUND')
  }
  if (!(user?.status === 'active')) {
    throw new Error(`USER_IS_${user?.status?.toUpperCase?.()}`)
  }
  if (!compareHashPassword(password, user?.password)) {
    throw new Error('PASSWORD_IS_INCORRECT')
  }
  if (user?.has_temp_password) {
    return { message: 'NEW_PASSWORD_REQUIRED', success: true }
  }

  return createAuthTokensForUser(sequelize, { ...user?.dataValues, ...custom_claims }, transaction)
}

export const loginAnApplication = async (sequelize, params = {}, transaction) => {
  validateProps(
    [
      { field: 'app_name', required: true, type: 'string' },
      { field: 'org_brand_id', required: false, type: 'string' },
      { field: 'org_id', required: false, type: 'string' },
      { field: 'token', required: true, type: 'string' }
    ],
    params
  )
  if (!(params?.token === process.env.APPLICATION_TOKEN)) {
    throw new Error('INVALID_APPLICATION_TOKEN')
  }

  const { app_name = 'public' } = params || {}
  if (!['organization', 'public', 'service'].includes(app_name)) {
    throw new Error('APP_NAME_IS_INVALID')
  }
  if (app_name === 'organization' && !params?.org_id) {
    throw new Error('MISSING_ORG_ID')
  }

  const userAndRolesMappingObj = {
    organization: { roles: ['public'], user_id: 'ORGANIZATION_APPLICATION' },
    public: { roles: ['public'], user_id: 'PUBLIC_APPLICATION' },
    service: { roles: ['service_manager'], user_id: 'SERVICE_APPLICATION' }
  }
  const appUser = await getAUser(
    sequelize,
    { where: { email: userAndRolesMappingObj[app_name]?.user_id } },
    transaction
  )
  if (!appUser?.id) {
    throw new Error('APPLICATION_IS_NOT_FOUND')
  }

  return createAuthTokensForUser(
    sequelize,
    {
      ...appUser?.dataValues,
      app_user_id: userAndRolesMappingObj[app_name]?.user_id,
      org_brand_id: params?.org_brand_id,
      org_id: params?.org_id,
      roles: userAndRolesMappingObj[app_name]?.roles
    },
    transaction
  )
}

export const logoutAUser = async (sequelize, params = {}, transaction) =>
  revokeAnAuthTokenForUser(sequelize, params, transaction)

export const logoutAUserByAdmin = async (sequelize, params = {}, transaction) =>
  revokeAuthTokensForUser(sequelize, params, transaction)

export const verifyTokenForUser = async (sequelize, params = {}, transaction) =>
  verifyAnAuthTokenForUser(sequelize, params, transaction)

export const refreshTokensForUser = async (sequelize, params = {}, transaction) =>
  refreshAuthTokensForUser(sequelize, params, transaction)

export const changeEmailByUser = async (sequelize, params = {}, transaction) => {
  validateProps(
    [
      { field: 'email', required: true, type: 'string' },
      { field: 'new_email', required: true, type: 'string' }
    ],
    params
  )

  const { email, new_email } = params || {}

  if (!validator.isEmail(new_email)) {
    throw new Error('INVALID_NEW_EMAIL')
  }

  const existingUser = await getAUser(
    sequelize,
    { where: { [Op.or]: [{ email: new_email }, { new_email }] } },
    transaction
  )
  if (existingUser?.id) {
    throw new Error('NEW_EMAIL_IS_ALREADY_ASSOCIATED_WITH_A_USER')
  }

  const user = await getAUser(sequelize, { where: { email } }, transaction)
  if (!user?.id) {
    throw new Error('USER_IS_NOT_FOUND')
  }
  if (!(user?.status === 'active')) {
    throw new Error(`USER_IS_${user?.status?.toUpperCase?.()}`)
  }
  if (user?.has_temp_password) {
    return { message: 'NEW_PASSWORD_REQUIRED', success: false }
  }

  await user.update({ new_email }, { transaction })

  await deleteVerificationTokens(
    sequelize,
    {
      where: {
        email: new_email,
        status: 'unverified',
        type: { [Op.in]: ['resend_user_verification', 'user_verification'] },
        user_id: user?.id
      }
    },
    transaction
  )

  await createAVerificationTokenAndSendNotification(
    sequelize,
    { ...user?.dataValues, email: new_email, type: 'user_verification', user_id: user?.id },
    transaction
  )

  return omit(user?.dataValues, ['old_passwords', 'password'])
}

export const cancelChangeEmailByUser = async (sequelize, params = {}, transaction) => {
  validateProps([{ field: 'email', required: true, type: 'string' }], params)

  const { email } = params || {}

  const user = await getAUser(sequelize, { where: { new_email: email } }, transaction)
  if (!user?.id) {
    throw new Error('USER_IS_NOT_FOUND')
  }
  if (!(user?.status === 'active')) {
    throw new Error(`USER_IS_${user?.status?.toUpperCase?.()}`)
  }
  if (user?.has_temp_password) {
    return { message: 'NEW_PASSWORD_REQUIRED', success: false }
  }

  await user.update({ new_email: null }, { transaction })

  const deletedTokens = await deleteVerificationTokens(
    sequelize,
    {
      where: {
        email,
        status: 'unverified',
        type: { [Op.in]: ['resend_user_verification', 'user_verification'] },
        user_id: user?.id
      }
    },
    transaction
  )
  if (deletedTokens <= 0) {
    throw new Error('NO_CHANGE_EMAIL_REQUEST_IS_FOUND')
  }

  return omit(user?.dataValues, ['old_passwords', 'password'])
}

export const verifyChangeEmailByUser = async (sequelize, params = {}, transaction) => {
  validateProps(
    [
      { field: 'token', required: true, type: 'string' },
      { field: 'user_id', required: true, type: 'string' }
    ],
    params
  )

  const { token, user_id } = params || {}
  const verificationToken = await readAVerificationToken(
    sequelize,
    {
      where: {
        status: 'unverified',
        type: { [Op.in]: ['resend_user_verification', 'user_verification'] },
        token,
        user_id
      }
    },
    transaction
  )
  if (!verificationToken?.id) {
    throw new Error('OTP_IS_NOT_VALID')
  }
  if (moment(verificationToken?.expired_at).isBefore(moment())) {
    throw new Error('OTP_IS_EXPIRED')
  }

  await verificationToken.destroy({ transaction })

  const user = await getAUser(sequelize, { where: { id: user_id } }, transaction)
  if (!user?.id) {
    throw new Error('USER_IS_NOT_FOUND')
  }
  if (!(user?.status === 'active')) {
    throw new Error(`USER_IS_${user?.status?.toUpperCase?.()}`)
  }
  if (user?.has_temp_password) {
    return { message: 'NEW_PASSWORD_REQUIRED', success: false }
  }

  await user.update({ email: user?.new_email, new_email: null }, { transaction })

  return omit(user?.dataValues, ['old_passwords', 'password'])
}

export const changeEmailByAdmin = async (sequelize, params = {}, transaction) => {
  validateProps(
    [
      { field: 'email', required: true, type: 'string' },
      { field: 'new_email', required: true, type: 'string' }
    ],
    params
  )

  const { email, new_email } = params || {}

  const existingUser = await getAUser(
    sequelize,
    { where: { [Op.or]: [{ email: new_email }, { new_email }] } },
    transaction
  )
  if (existingUser?.id) {
    throw new Error('NEW_EMAIL_IS_ALREADY_ASSOCIATED_WITH_A_USER')
  }

  const user = await getAUser(sequelize, { where: { email } }, transaction)
  if (!user?.id) {
    throw new Error('USER_IS_NOT_FOUND')
  }

  await user.update({ email: new_email, new_email: null }, { transaction })

  return omit(user?.dataValues, ['old_passwords', 'password'])
}

export const changePasswordByUser = async (sequelize, params = {}, transaction) => {
  validateProps(
    [
      { field: 'new_password', required: true, type: 'string' },
      { field: 'old_password', required: true, type: 'string' },
      { field: 'user_id', required: true, type: 'string' }
    ],
    params
  )

  const { new_password, old_password, user_id } = params || {}

  if (new_password === old_password) {
    throw new Error('NEW_PASSWORD_IS_SAME_AS_OLD_PASSWORD')
  }

  const user = await getAUser(sequelize, { where: { id: user_id } }, transaction)
  if (!user?.id) {
    throw new Error('USER_IS_NOT_FOUND')
  }
  if (!(user?.status === 'active')) {
    throw new Error(`USER_IS_${user?.status?.toUpperCase?.()}`)
  }
  if (!checkPasswordPolicy(new_password)) {
    throw new Error('PASSWORD_DID_NOT_CONFORM_OUR_POLICY')
  }
  // Check for old passwords
  if (!compareHashPassword(old_password, user?.password)) {
    throw new Error('OLD_PASSWORD_IS_INCORRECT')
  }
  if (checkOldPasswords(new_password, user?.old_passwords)) {
    throw new Error('PASSWORD_IS_ALREADY_USED_BEFORE')
  }

  const hashPassword = generateHashPassword(new_password)

  const updatingData = { password: hashPassword }
  if (user?.has_temp_password) {
    updatingData.has_temp_password = false
  } else {
    updatingData.old_passwords = [...slice(user.old_passwords, 1, 3), hashPassword]
  }

  await user.update(updatingData, { transaction })

  await deleteAuthTokensForUser(sequelize, { where: { user_id } }, transaction)

  return omit(user?.dataValues, ['old_passwords', 'password'])
}

export const changePasswordByAdmin = async (sequelize, params = {}, transaction) => {
  validateProps(
    [
      { field: 'email', required: true, type: 'string' },
      { field: 'password', required: true, type: 'string' }
    ],
    params
  )

  const { email, password } = params || {}

  const user = await getAUser(sequelize, { where: { email } }, transaction)
  if (!user?.id) {
    throw new Error('USER_IS_NOT_FOUND')
  }

  const hashPassword = generateHashPassword(password)
  const old_passwords = [...slice(user?.old_passwords, 1, 3), hashPassword]

  await user.update({ has_temp_password: false, old_passwords, password: hashPassword }, { transaction })

  await deleteAuthTokensForUser(sequelize, { where: { user_id: user?.id } }, transaction)

  return omit(user?.dataValues, ['old_passwords', 'password'])
}

export const forgotPassword = async (sequelize, params = {}, transaction) => {
  validateProps([{ field: 'email', required: true, type: 'string' }], params)

  const { email } = params || {}

  const user = await getAUser(sequelize, { where: { email } }, transaction)
  if (!user?.id) {
    throw new Error('USER_IS_NOT_FOUND')
  }

  const existingTokens = await readVerificationTokens(
    sequelize,
    {
      order: [['created_at', 'desc']],
      where: {
        created_at: { [Op.gte]: moment().subtract(10, 'minutes').toDate() },
        email,
        status: { [Op.in]: ['cancelled', 'unverified'] },
        type: 'forgot_password',
        user_id: user?.id
      }
    },
    transaction
  )
  if (size(existingTokens) >= 3) {
    throw new Error('TOO_MANY_FORGOT_PASSWORD_REQUESTS')
  }

  await updateVerificationTokens(
    sequelize,
    {
      data: { status: 'cancelled' },
      options: { where: { email, status: 'unverified', type: 'forgot_password', user_id: user?.id } }
    },
    transaction
  )
  await createAVerificationTokenAndSendNotification(
    sequelize,
    { ...user?.dataValues, type: 'forgot_password', user_id: user?.id },
    transaction
  )

  return omit(user?.dataValues, ['old_passwords', 'password'])
}

export const retryForgotPassword = async (sequelize, params = {}, transaction) => {
  validateProps([{ field: 'email', required: true, type: 'string' }], params)

  const { email } = params || {}

  const user = await getAUser(sequelize, { where: { email } }, transaction)
  if (!user?.id) {
    throw new Error('USER_IS_NOT_FOUND')
  }

  const existingTokens = await readVerificationTokens(
    sequelize,
    {
      order: [['created_at', 'desc']],
      where: {
        created_at: { [Op.gte]: moment().subtract(10, 'minutes').toDate() },
        email,
        status: { [Op.in]: ['cancelled', 'unverified'] },
        type: { [Op.in]: ['forgot_password', 'resend_forgot_password'] },
        user_id: user?.id
      }
    },
    transaction
  )
  if (size(existingTokens) >= 3) {
    throw new Error('TOO_MANY_FORGOT_PASSWORD_REQUESTS')
  }

  await updateVerificationTokens(
    sequelize,
    {
      data: { status: 'cancelled' },
      options: {
        where: {
          email,
          status: 'unverified',
          type: { [Op.in]: ['forgot_password', 'resend_forgot_password'] },
          user_id: user?.id
        }
      }
    },
    transaction
  )
  await createAVerificationTokenAndSendNotification(
    sequelize,
    { ...user?.dataValues, type: 'resend_forgot_password', user_id: user?.id },
    transaction
  )

  return omit(user?.dataValues, ['old_passwords', 'password'])
}

export const verifyForgotPasswordCode = async (sequelize, params = {}, transaction) => {
  validateProps(
    [
      { field: 'email', required: true, type: 'string' },
      { field: 'token', required: true, type: 'string' }
    ],
    params
  )

  const { email, token } = params || {}
  const verificationToken = await readAVerificationToken(
    sequelize,
    {
      where: {
        email,
        status: 'unverified',
        token,
        type: { [Op.in]: ['forgot_password', 'resend_forgot_password'] }
      }
    },
    transaction
  )
  if (!verificationToken?.id) {
    throw new Error('OTP_IS_NOT_VALID')
  }
  if (moment(verificationToken?.expired_at).isBefore(moment())) {
    throw new Error('OTP_IS_EXPIRED')
  }

  return { message: 'OTP_IS_VALID', success: true }
}

export const verifyForgotPassword = async (sequelize, params = {}, transaction) => {
  validateProps(
    [
      { field: 'email', required: true, type: 'string' },
      { field: 'password', required: true, type: 'string' },
      { field: 'token', required: true, type: 'string' }
    ],
    params
  )

  const { email, password, token } = params || {}
  const verificationToken = await readAVerificationToken(
    sequelize,
    { where: { email, status: 'unverified', token, type: { [Op.in]: ['forgot_password', 'resend_forgot_password'] } } },
    transaction
  )
  if (!verificationToken?.id) {
    throw new Error('OTP_IS_NOT_VALID')
  }
  if (moment(verificationToken?.expired_at).isBefore(moment())) {
    throw new Error('OTP_IS_EXPIRED')
  }

  const user = await getAUser(sequelize, { where: { email } }, transaction)
  if (!user?.id) {
    throw new Error('USER_IS_NOT_FOUND')
  }
  if (!checkPasswordPolicy(password)) {
    throw new Error('PASSWORD_DID_NOT_CONFORM_OUR_POLICY')
  }
  // Check for old passwords
  if (compareHashPassword(password, user?.password)) {
    throw new Error('PASSWORD_IS_ALREADY_USED_BEFORE')
  }
  if (checkOldPasswords(password, user?.old_passwords)) {
    throw new Error('PASSWORD_IS_ALREADY_USED_BEFORE')
  }

  const hashPassword = generateHashPassword(password)
  const old_passwords = [...slice(user?.old_passwords, 1, 3), hashPassword]

  await user.update({ has_temp_password: false, old_passwords, password: hashPassword }, { transaction })

  await deleteVerificationTokens(
    sequelize,
    { where: { email, type: { [Op.in]: ['forgot_password', 'resend_forgot_password'] } }, user_id: user?.id },
    transaction
  )
  await deleteAuthTokensForUser(sequelize, { where: { user_id: user?.id } }, transaction)

  return omit(user?.dataValues, ['old_passwords', 'password'])
}

export const verifyUserPassword = async (sequelize, params = {}, transaction) => {
  validateProps(
    [
      { field: 'email', required: true, type: 'string' },
      { field: 'password', required: true, type: 'string' }
    ],
    params
  )

  const { email, password } = params || {}

  const user = await getAUser(sequelize, { where: { email } }, transaction)
  if (!user?.id) {
    throw new Error('USER_IS_NOT_FOUND')
  }
  if (!(user?.status === 'active')) {
    throw new Error(`USER_IS_${user?.status?.toUpperCase?.()}`)
  }
  if (!compareHashPassword(password, user?.password)) {
    return { message: 'PASSWORD_IS_INCORRECT', success: false }
  }

  return { message: 'PASSWORD_IS_CORRECT', success: true }
}
