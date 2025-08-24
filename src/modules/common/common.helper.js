import axios from 'axios'
import { JSDOM } from 'jsdom'
import {
  find,
  has,
  head,
  intersection,
  isArray,
  isBoolean,
  isEmpty,
  isNumber,
  isObject,
  join,
  map,
  size,
  split,
  transform
} from 'lodash'
import mime from 'mime-types'
import moment from 'moment-timezone'
import slugify from 'slugify'
import validator from 'validator'

// Helper
import { organizationHelper } from 'src/modules/helpers'

// Utils
import { sequelize } from 'src/utils/database'
import { CustomError } from 'src/utils/error'
import { logger } from 'src/utils/logger'

export const checkRequiredFields = (requiredFields = [], data = {}) => {
  const missingFields = []
  for (let i = 0; i < requiredFields?.length; i++) {
    const field = requiredFields[i]

    if (isEmpty(data[field]) && !isNumber(data[field]) && !isBoolean(data[field])) {
      missingFields.push(field)
    }
  }

  if (size(missingFields)) {
    throw new CustomError(400, `Missing ${missingFields.join?.(', ')}`)
  }
}

export const prepareRequestQuery = (args, context) => {
  const { queryData = {}, optionData = {} } = args || {}
  const { limit = 50, offset = 0, order = [['created_at', 'DESC']] } = optionData || {}

  return { options: { limit, offset, order }, query: queryData || {}, user: context?.user || {} }
}

export const validateEmail = (email) => {
  const isValid = email.match(
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  )
  if (!isValid) {
    throw new CustomError(400, 'INVALID_EMAIL')
  }

  return isValid
}

export const validateUUID = (uuid) => {
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i

  return regex.test(uuid)
}

export const isUrlValid = (input = '') => validator.isURL(input)

export const validateDomain = (params) => {
  const { domain, sub_domain, user_input_domain = '' } = params || {}

  const specialCharactersRegex = /[!@#$%^&*]/
  if (user_input_domain && specialCharactersRegex.test(user_input_domain)) {
    throw new CustomError(400, 'SPECIAL_CHARACTERS_NOT_ALLOWED')
  }

  if (sub_domain && (sub_domain.includes('--') || sub_domain.includes('.'))) {
    throw new CustomError(400, 'INVALID_SUBDOMAIN_FORMAT')
  }

  const domainToValidate = domain || (sub_domain && `${sub_domain}.${getAppDomainName()}`)

  if (!domainToValidate || !validator.isFQDN(domainToValidate)) throw new CustomError(400, 'INVALID_DOMAIN')
}

export const isValidatePhoneNumber = (phoneNumber = '') => {
  const phoneRegex = /^(\+|\d)[0-9]{5,}$/
  const cleanedPhoneNumber = phoneNumber.replace(/[-\s()]/g, '')

  return !!phoneRegex.test(cleanedPhoneNumber)
}

export const getAppName = () => {
  const appName = process.env.COPILOT_APPLICATION_NAME

  if (!appName) return 'Easydesk'

  return getFirstLetterUpperCase(appName)
}

export const getAppDomainName = () => {
  const stage = process.env.COPILOT_ENVIRONMENT_NAME || 'local'

  return stage === 'prod' ? 'easydesk.app' : `${stage}.easydesk.app`
}

export const getAdminAppUrl = () => `https://admin.${getAppDomainName()}`

export const getPublicAppUrl = () => `https://${getAppDomainName()}`

export const getOrganizationAppUrl = (sub_domain) =>
  sub_domain ? `https://${sub_domain}.${getAppDomainName()}` : `https://${getAppDomainName()}`

export const getSupportPortalUrl = ({ custom_domain, sub_domain }) =>
  custom_domain ? `https://${custom_domain}` : `https://${sub_domain}.portal.${getAppDomainName()}`

export const getFullChannelEmailForOrg = (emailSting, subdomain) => {
  if (!emailSting || !subdomain) throw new CustomError(400, 'REQUIRED_DATA_MISSING_TO_CREATE_CHANNEL_EMAIL')
  const appName = process.env.COPILOT_APPLICATION_NAME || 'easydesk'

  const channelEmail =
    process.env.COPILOT_ENVIRONMENT_NAME !== 'prod'
      ? `${emailSting}@${subdomain}.${process.env.COPILOT_ENVIRONMENT_NAME}.${appName}.app`
      : `${emailSting}@${subdomain}.${appName}.app`
  validateEmail(channelEmail)

  return channelEmail
}

export const getImgixPublicCDNUrl = (key) => {
  if (!key) return ''

  const env = process.env.COPILOT_ENVIRONMENT_NAME
  const app_name = process.env.COPILOT_APPLICATION_NAME

  return `https://${app_name}-${env}-public.imgix.net/${key}`
}

export const commonUserLookupQuery = (
  association = 'author',
  attributes = ['id', 'email', 'first_name', 'last_name', 'social_id'],
  required = false
) => ({
  association,
  attributes,
  required,
  include: [{ association: 'avatar_file', attributes: ['id', 'key', 'title', 'visibility'] }]
})

export const isValidTimeZone = (timezone) => {
  const offsetPattern = /^UTC [+-](0[0-9]|1[0-4]):00$/

  if (!offsetPattern.test(timezone)) return false

  // If the input matches the pattern, attempt to create a moment with the input offset
  const momentObj = moment().utcOffset(timezone)

  // Check if the moment object was successfully created and valid
  return momentObj.isValid()
}

export const getSubDomainByOrgId = async (org_id, transaction) => {
  if (!org_id) throw new CustomError(400, 'ORG_ID_IS_REQUIRED')
  const org = await organizationHelper.getAnOrganization({ where: { id: org_id } }, transaction)
  if (!org) throw new CustomError(404, 'ORG_NOT_FOUND')

  return org.sub_domain
}

export const validateUserPermission = ({
  action,
  associated = undefined,
  module,
  permissions = {},
  doNotThrowError = false
} = {}) => {
  const permission = find(permissions?.[module] || [], (perm) => perm?.action === action)
  const isValid = permission?.can_do_the_action

  if (!doNotThrowError && (!isValid || (associated !== undefined && associated === false))) {
    throw new CustomError(403, 'PERMISSION_DENIED')
  }

  return !!isValid
}

export const prepareDomainNameForAmplify = (domain = '') => {
  // Split by dot for getting each section between dot
  const domainStrArray = split(domain, '.')

  // If there is only one dot in the domain then it is main domain and nothing to do for it
  if (size(domainStrArray) === 2) return domain

  // Remove 0 index element as it will be prefixed
  domainStrArray.shift()

  // Join all of them again
  return join(domainStrArray, '.')
}

export const getTopRoleOfAUser = (roles = []) => head(intersection(['admin', 'developer', 'moderator', 'user'], roles))

export const verifyGoogleCaptchaResponse = async (captchaResponse) => {
  try {
    const response = await axios.post(`${process.env.GOOGLE_CAPTCHA_VERIFICATION_URL}&response=${captchaResponse}`)

    return { success: !!response?.data?.success }
  } catch {
    return { success: false }
  }
}

export const generateUniqueSlugForModule = async (params, transaction) => {
  const { moduleEntity, moduleQuery = {}, slug_title } = params || {}

  checkRequiredFields(['moduleEntity', 'slug_title'], params)

  const slug = slugify(slug_title, { lower: true })

  const isSlugExist = await moduleEntity.findOne({ where: { slug, ...moduleQuery }, transaction })
  if (isSlugExist?.id) return `${slug}-${new Date().getTime()}`

  return slug
}

export const parseTextFromHTML = (content) => {
  const dom = new JSDOM(content)
  const body = dom?.window?.document?.body || {}
  return body?.textContent?.replace?.(/[^a-zA-Z0-9\s]/g, ' ')
}

export const generateTSVector = (title, content) =>
  sequelize.literal(`to_tsvector('english', '${title || ''}' || ' ' || '${parseTextFromHTML(content) || ''}')`)

export const prepareURLObjectFromString = (str = '') => {
  try {
    if (!str) return {}

    return new URL(str)
  } catch (err) {
    logger.error('server', 'Error in prepareURLObjectFromString:', err)
    return {}
  }
}

export const getOrgSubDomainFromRequest = (req) => {
  const { hostname = '' } = prepareURLObjectFromString(req?.headers?.origin)

  return head(split(hostname, '.'))
}

export const validateFeedbackKeyFormat = (key) => {
  const keyRegex = /^(?=.*[A-Z])[A-Z0-9]{3,5}$/
  const isValid = keyRegex.test(key)
  if (!isValid) throw new CustomError(400, 'INVALID_FEEDBACK_KEY_FORMAT')

  return isValid
}

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

export const getFirstLetterUpperCase = (str) => {
  if (!size(str)) return ''

  return str?.charAt?.(0)?.toUpperCase?.() + str?.slice?.(1)
}

/**
 * Compare objects: only include properties that exist in original and have differences
 */
export const getModifiedObjectProperties = (originalObject, modifiedObject, doNotThrowError = false) => {
  if (!isObject(originalObject) || !isObject(modifiedObject)) {
    if (doNotThrowError) return {}
    throw new CustomError(400, 'ORIGINAL_OBJECT_OR_MODIFIED_OBJECT_IS_NOT_OBJECT')
  }

  return transform(
    modifiedObject,
    (acc, value, key) => {
      if (has(originalObject, key)) {
        // Include the difference if:
        // - It's an object
        // - It's an array
        // - The original value is different from the modified value
        if (isObject(value) || isArray(value) || originalObject[key] !== value) {
          acc[key] = value
        }
      }
    },
    {}
  )
}

/**
 * Get model column maps for JSON build object
 * @author [emranffl](https://linkedin.com/in/emranffl)
 */
export const getModelColumnMapsForJSONBuildObject = (model, alias = null) => {
  if (!model || typeof model !== 'function' || !model.getAttributes || typeof model.getAttributes !== 'function') {
    throw new CustomError(400, 'INVALID_MODEL')
  }
  if (alias === null) alias = model.tableName
  else if (alias && typeof alias !== 'string') throw new CustomError(400, 'INVALID_ALIAS')

  const preparedColumns = []
  map(Object.keys(model.getAttributes()), (key) => {
    const accessor = alias ? `${alias}.${key}` : key
    preparedColumns.push(`'${key}', ${accessor}`)
  })

  return preparedColumns.join(', ')
}

export const checkPasswordPolicy = (password) => {
  if (size(password) < 8) return false

  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[-+_!@#$%^&*.,?]).+$/

  return regex.test(password)
}

export const generatePasswordPerPolicy = (prependText = '') => {
  if (!prependText) prependText = getRandomString(7)
  return `${prependText}@Aa`
}

export const validateNumber = (number, { key = 'NUMBER', max, min }) => {
  if (typeof number !== 'number' || isNaN(number)) {
    throw new CustomError(400, 'INVALID_NUMBER')
  }
  if (min !== undefined && number < min) {
    throw new CustomError(400, `${key}_SHOULD_NOT_BE_LESS_THAN_${min}`)
  }
  if (max !== undefined && number > max) {
    throw new CustomError(400, `${key}_SHOULD_NOT_BE_GREATER_THAN_${max}`)
  }
  return true
}

export const getFileExtension = (mimeType) => {
  const extension = mime.extension(mimeType)
  if (extension) return extension

  return ''
}
