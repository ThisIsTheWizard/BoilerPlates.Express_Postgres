import { pick } from 'lodash'

// Entities
import { RoleEntity } from 'src/modules/entities'

// Helpers
import { roleHelper, rolePermissionHelper } from 'src/modules/helpers'

// Services
import { rolePermissionService } from 'src/modules/services'

// Utils
import { CustomError } from 'src/utils/error'

export const createARole = async (data, options, transaction) => RoleEntity.create(data, { ...options, transaction })

export const createRoles = async (data, options, transaction) =>
  RoleEntity.bulkCreate(data, { ...options, transaction })

export const updateARole = async (options, data, transaction) => {
  const role = await RoleEntity.findOne({ ...options, transaction })
  if (!role?.id) {
    throw new CustomError(404, 'ROLE_NOT_FOUND')
  }

  await role.update(data, { transaction })

  return role
}

export const deleteARole = async (options, transaction) => {
  const role = await RoleEntity.findOne({ ...options, transaction })
  if (!role?.id) {
    throw new CustomError(404, 'ROLE_NOT_FOUND')
  }

  await role.destroy({ transaction })

  return role
}

export const deleteRoles = async (options, transaction) =>
  RoleEntity.destroy({ ...options, returning: true, transaction })

export const addARoleForMutation = async (params, user, transaction) => {
  const role = { created_by: user.user_id, name: params.name }

  return createARole(role, null, transaction)
}

export const createDefaultRoleAndPermissions = async (appRole, transaction) => {
  const role = await createARole(pick(appRole, ['name', 'org_id']), null, transaction)
  if (!role?.id) {
    throw new CustomError(500, 'ROLE_CREATION_FAILED')
  }

  const appRolePermissions = await rolePermissionHelper.getRolePermissions(
    { where: { role_id: appRole?.id } },
    transaction
  )

  const rolePermissions = []
  for (const rolePermission of JSON.parse(JSON.stringify(appRolePermissions))) {
    rolePermissions.push({
      ...pick(rolePermission, ['can_do_the_action', 'permission_id', 'scope']),
      role_id: role?.id
    })
  }

  return {
    role,
    role_permissions: await rolePermissionService.createRolePermissions(rolePermissions, null, transaction)
  }
}

export const createDefaultRolesAndPermissionsForOrg = async (org_id, transaction) => {
  const roles = await roleHelper.getRoles(
    {
      where: {
        name: ['org_owner', 'org_admin', 'org_group_manager', 'org_agent', 'org_collaborator', 'org_user'],
        org_id: null
      }
    },
    transaction
  )

  const promisesArray = []
  for (const role of JSON.parse(JSON.stringify(roles))) {
    role.org_id = org_id
    promisesArray.push(createDefaultRoleAndPermissions(role, transaction))
  }

  return Promise.all(promisesArray)
}
