// Entities
import { AuthTokenEntity } from 'src/modules/entities'

export const getAnAuthToken = async (options, transaction) => AuthTokenEntity.findOne({ ...options, transaction })

export const getAuthTokens = async (options, transaction) => AuthTokenEntity.findAll({ ...options, transaction })

export const countAuthTokens = async (options) => AuthTokenEntity.count(options)
