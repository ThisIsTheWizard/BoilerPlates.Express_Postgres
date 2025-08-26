import {} from 'lodash'
import { Op } from 'sequelize'

// Entities
import { RoleUserEntity } from 'src/modules/entities'

// Helpers
import { commonHelper, roleHelper, roleUserHelper } from 'src/modules/helpers'

// Services
import { roleUserService } from 'src/modules/services'

// Utils
import { CustomError } from 'src/utils/error'

export const createARoleUser = async (data, options, transaction) =>
  RoleUserEntity.create(data, { ...options, transaction })

export const updateARoleUser = async (options, data, transaction) => {
  const roleUser = await RoleUserEntity.findOne({ ...options, transaction })
  if (!roleUser?.id) {
    throw new CustomError(404, 'ROLE_USER_NOT_FOUND')
  }

  await roleUser.update(data, { transaction })

  return roleUser
}

export const deleteARoleUser = async (options, transaction) => {
  const roleUser = await RoleUserEntity.findOne({ ...options, transaction })
  if (!roleUser?.id) {
    throw new CustomError(404, 'ROLE_USER_NOT_FOUND')
  }

  await roleUser.destroy({ transaction })

  return roleUser
}

export const assignARoleToUserByName = async (params, transaction) => {
  commonHelper.validateRequiredProps(['role_name', 'user_id'], params)

  const roleUserCreationData = { user_id: params?.user_id }

  const role = await roleHelper.getARole({ where: { name: params?.role_name } }, transaction)
  if (!role?.id) {
    throw new CustomError(404, 'ROLE_DOES_NOT_EXIST')
  }

  roleUserCreationData.role_id = role.id

  return createARoleUser(roleUserCreationData, null, transaction)
}

export const revokeARoleFromUserByName = async (params, transaction) => {
  commonHelper.validateRequiredProps(['role_name', 'user_id'], params)

  const role = await roleHelper.getARole({ where: { name: params?.role_name } })
  if (!role?.id) {
    throw new CustomError(404, 'ROLE_DOES_NOT_EXIST')
  }

  const removedRoleUser = await roleUserService.deleteARoleUser(
    { where: { user_id: params?.user_id, role_id: role?.id } },
    transaction
  )
  if (!removedRoleUser?.id) {
    throw new CustomError(500, 'COULD_NOT_REMOVE_ROLE_USER')
  }

  return removedRoleUser
}

export const updateARoleUserByName = async (params, transaction) => {
  const { role_name, status, user } = params || {}
  if (!(role_name && user?.id)) {
    throw new CustomError(400, 'BAD_INPUT')
  }

  const roleQuery = { name: role_name }
  if (user.org_id) roleQuery.org_id = user.org_id

  const role = await roleHelper.getARole({ where: roleQuery })
  if (!role?.id) throw new CustomError(404, 'ROLE_NOT_FOUND')

  const updatedRoleUser = await roleUserService.updateARoleUser(
    { where: { user_id: user?.id, role_id: role?.id } },
    { status },
    transaction
  )
  if (updatedRoleUser?.id) {
    throw new CustomError(500, 'COULD_NOT_UPDATE_ROLE_USER')
  }

  return updatedRoleUser
}

export const createARoleUserByRole = async (params, transaction) => {
  const { app_user_id, org_id, org_user_id, user_id } = params || {}
  if (!(params.role && user_id)) {
    throw new CustomError(400, 'BAD_INPUT_FOR_ADDING_ROLE_USER')
  }

  const roleUserCreationData = { user_id }

  let role = params.role
  if (!role?.id) {
    const roleQuery = { name: role }
    if (org_id && !['admin', 'manager', 'user'].includes(role)) {
      roleQuery.org_id = org_id
    }
    const roleOrQuery = [roleQuery]
    if (commonHelper.validateUUID(role)) {
      roleOrQuery.push({ id: role })
    }
    role = await roleHelper.getARole({ where: { [Op.or]: roleOrQuery } }, transaction)
  }
  if (!role?.id) {
    throw new CustomError(404, 'COULD_NOT_FIND_ROLE')
  }
  roleUserCreationData.role_id = role.id

  const role_name = role?.name || role
  if (['admin', 'manager'].includes(role_name) && app_user_id) {
    roleUserCreationData.app_user_id = app_user_id
  }
  if (!['admin', 'manager', 'user'].includes(role_name)) {
    if (org_id) roleUserCreationData.org_id = org_id
    if (org_user_id) roleUserCreationData.org_user_id = org_user_id
  }

  const roleUserQuery = { role_id: roleUserCreationData.role_id, user_id: roleUserCreationData.user_id }
  if (roleUserCreationData.org_id) roleUserQuery.org_id = org_id
  if (roleUserCreationData.org_user_id) roleUserQuery.org_user_id = org_user_id
  let roleUser = await roleUserHelper.getARoleUser({ where: roleUserQuery }, transaction)
  if (!roleUser?.id) {
    roleUser = await createARoleUser(roleUserCreationData, null, transaction)
  }

  return roleUser
}

export const createRoleUsersForAnUser = async (params, transaction) => {
  const { app_user_id, org_id, org_user_id, roles, user_id } = params || {}

  const promisesArrayForRoles = [createARoleUserByRole({ role: 'user', user_id }, transaction)]

  for (let i = 0; i < roles?.length; i++) {
    const role = roles[i]
    if (role) {
      promisesArrayForRoles.push(
        createARoleUserByRole({ app_user_id, org_id, org_user_id, role, user_id }, transaction)
      )
    }
  }
  if (!promisesArrayForRoles?.length) {
    throw new CustomError(500, 'COULD_NOT_ASSIGN_ROLES')
  }

  const createdRoles = await Promise.all(promisesArrayForRoles)
  if (roles?.length !== createdRoles?.length - 1) {
    throw new CustomError(500, 'COULD_NOT_ASSIGN_ROLES')
  }

  return createdRoles
}

export const removeRoleUsersForAnUser = async (params, transaction) => {
  const { app_user_id, org_id, org_user_id, roles, user_id } = params || {}

  const promisesArray = []
  for (let i = 0; i < roles?.length; i++) {
    const role = roles[i]
    if (role) {
      promisesArray.push(
        revokeARoleFromUserByName({ app_user_id, org_id, org_user_id, role_name: role, user_id }, transaction)
      )
    }
  }
  if (!promisesArray?.length) {
    throw new CustomError(500, 'COULD_NOT_REVOKE_ROLES')
  }

  const removedRoles = await Promise.all(promisesArray)
  if (roles?.length !== removedRoles?.length) {
    throw new CustomError(500, 'COULD_NOT_REVOKE_ROLES')
  }

  return removedRoles
}
