import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { size } from 'lodash'

export const getRandomNumber = (length) => {
  const characters = '0123456789'

  let result = ''
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length)
    result += characters.charAt(randomIndex)
  }

  return result
}

export const getRandomString = (length) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

  let result = ''
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length)
    result += characters.charAt(randomIndex)
  }

  return result
}

export const checkPasswordPolicy = (password) => {
  if (size(password) < 8) return false

  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[-+_!@#$%^&*.,?]).+$/

  return regex.test(password)
}

export const compareHashPassword = (str = '', hashStr) => {
  if (!str || !hashStr) return false

  return bcrypt.compareSync(str, hashStr)
}

export const checkOldPasswords = (new_password, oldPasswords = []) => {
  let isOldPasswordMatched = false
  for (const password of oldPasswords) {
    if (compareHashPassword(new_password, password)) {
      isOldPasswordMatched = true
    }
  }
  return isOldPasswordMatched
}

export const generateHashPassword = (str = '') => bcrypt.hashSync(str, 10)

export const generateJWTToken = (payload = {}, expiresIn = '1h') =>
  jwt.sign(
    {
      iss: getAppDomain(),
      sub: payload?.sub || getRandomString(17),
      aud: payload?.aud || getRandomString(17),
      jti: payload?.jti || getRandomString(17),
      ...payload
    },
    process.env.JWT_SECRET,
    { expiresIn }
  )

export const decodeJWTToken = (token) => jwt.decode(token)

export const verifyJWTToken = (token) => {
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)

    return { message: 'TOKEN_IS_VERIFIED', payload, success: true }
  } catch (err) {
    return {
      message: err?.message?.replaceAll(' ', '_')?.toUpperCase?.(),
      success: false
    }
  }
}

export const getAppName = () => process.env.COPILOT_APPLICATION_NAME || 'gain'

export const getAppDomain = () => {
  const domainMaps = {
    gain: 'gain.io',
    payrun: 'payrun.app',
    easydesk: 'easydesk.app'
  }
  return domainMaps[getAppName()]
}

export const getAppURL = () => `https://${getAppDomain()}`

export const getImgixPublicURL = () => {
  const cdnMaps = {
    gain: 'gain-dev-public',
    payrun: 'payrun-public',
    easydesk: 'easydesk-prod-public'
  }
  return `https://${cdnMaps[getAppName()]}.imgix.net`
}
