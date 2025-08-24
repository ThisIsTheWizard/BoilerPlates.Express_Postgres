export const createAVerificationTokenAndSendNotification = async (sequelize, params, transaction) => {
  const types = getVerificationTokenTypes()
  if (!params?.user_id && params?.type && !types.includes(params?.type)) {
    return false
  }

  const verificationToken = await createAVerificationToken(
    sequelize,
    {
      email: params?.email,
      token: getRandomNumber(6),
      type: params?.type,
      user_id: params?.user_id
    },
    transaction
  )
  if (!verificationToken?.id) {
    throw new Error('COULD_NOT_SEND_VERIFICATION_TOKEN')
  }

  const eventMappingObject = {
    forgot_password: 'send_forgot_password_token',
    user_verification: 'send_user_verification_token'
  }

  await sendNotification(sequelize, {
    event: eventMappingObject[params?.type],
    to_email: params?.email,
    variables: {
      email: params?.email,
      token: verificationToken?.token,
      url: getAppURL(),
      username:
        params?.first_name || params?.last_name ? [params?.first_name || '', params?.last_name || ''].join(' ') : ''
    }
  })

  return verificationToken
}
