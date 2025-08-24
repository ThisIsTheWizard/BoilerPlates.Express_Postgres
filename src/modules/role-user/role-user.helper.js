// Entities
import { RoleUserEntity } from 'src/modules/entities'

// Helpers
import {} from 'src/modules/helpers'

// Utils
import {} from 'src/utils/error'

export const getARoleUser = async (options, transaction) => RoleUserEntity.findOne({ ...options, transaction })

export const getRoleUsers = async (options, transaction) => RoleUserEntity.findAll({ ...options, transaction })

export const countRoleUsers = async (options) => RoleUserEntity.count(options)
