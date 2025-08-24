import { size } from 'lodash'
import { Op } from 'sequelize'

// Entities
import { RolePermissionEntity } from 'src/modules/entities'

// Helpers
import { commonHelper, roleHelper, rolePermissionHelper } from 'src/modules/helpers'

// Utils
import { CustomError } from 'src/utils/error'

export const createARolePermission = async (data, options, transaction) =>
  RolePermissionEntity.create(data, { ...options, transaction })

export const createRolePermissions = async (data, options, transaction) =>
  RolePermissionEntity.bulkCreate(data, { ...options, transaction })

export const updateARolePermission = async (options, data, transaction) => {
  const rolePermission = await rolePermissionHelper.getARolePermission(options, transaction)
  if (!rolePermission?.id) {
    throw new CustomError(404, 'ROLE_PERMISSION_NOT_FOUND')
  }

  await rolePermission.update(data, { transaction })

  return rolePermission
}

export const deleteARolePermission = async (options, transaction) => {
  const rolePermission = await rolePermissionHelper.getARolePermission(options, transaction)
  if (!rolePermission?.id) {
    throw new CustomError(404, 'ROLE_PERMISSION_NOT_FOUND')
  }

  await rolePermission.destroy({ transaction })

  return rolePermission
}

export const getActionsMappingObjectForPermission = () => ({
  admin: 'can_update_app_admin_permission',
  manager: 'can_update_app_manager_permission',
  org_admin: 'can_update_admin_permission',
  org_agent: 'can_update_agent_permission',
  org_collaborator: 'can_update_collaborator_permission',
  org_group_manager: 'can_update_manager_permission',
  org_owner: 'can_update_owner_permission'
})

export const createARolePermissionForMutation = async (params, user, transaction) => {
  const { can_do_the_action, permission_id, role_name, scope = 'all' } = params || {}

  const { id: role_id, org_id: role_org_id } =
    (await roleHelper.getARole({ where: { name: role_name, org_id: user?.org_id || null } }, transaction)) || {}
  if (!role_id) {
    throw new CustomError(404, 'COULD_NOT_FIND_ROLE')
  }

  const existingRolePerm = await rolePermissionHelper.getARolePermission(
    { where: { permission_id, role_id } },
    transaction
  )
  if (existingRolePerm?.id) {
    throw new CustomError(400, 'ROLE_PERMISSION_ALREADY_EXISTS')
  }

  // Validate user permission for updating role permission
  commonHelper.validateUserPermission({
    action: getActionsMappingObjectForPermission()[role_name],
    module: 'role',
    permissions: user?.permissions
  })

  const rolePermission = await createARolePermission(
    { can_do_the_action, permission_id, role_id, scope },
    null,
    transaction
  )
  if (!rolePermission?.id) {
    throw new CustomError(500, 'COULD_NOT_CREATE_ROLE_PERMISSION')
  }

  if (!['admin', 'manager'].includes(role_name) && !role_org_id) {
    const roles = await roleHelper.getRoles(
      {
        include: [{ association: 'permissions', required: false, where: { id: permission_id } }],
        where: { name: role_name, org_id: { [Op.ne]: null } }
      },
      transaction
    )

    const orgRolePermissions = []
    for (const role of roles) {
      if (!size(role?.permissions)) {
        orgRolePermissions.push({ can_do_the_action, permission_id, role_id: role?.id, scope })
      }
    }

    await RolePermissionEntity.bulkCreate(orgRolePermissions, { transaction })
  }

  return rolePermission
}

export const updateARolePermissionForMutation = async (params, user, transaction) => {
  const { inputData, queryData } = params || {}

  const rolePermission = await rolePermissionHelper.getARolePermission(
    { include: [{ association: 'role' }], where: { id: queryData?.entity_id } },
    transaction
  )
  if (!rolePermission?.id) {
    throw new CustomError(404, 'COULD_NOT_FIND_ROLE_PERMISSION')
  }

  // Validate user permission for updating role permission
  commonHelper.validateUserPermission({
    action: getActionsMappingObjectForPermission()[rolePermission?.role?.name],
    module: 'role',
    permissions: user?.permissions
  })

  // Update role permission data with updated_by
  await rolePermission.update({ ...inputData, updated_by: user?.user_id || null }, { transaction })

  if (!['admin', 'manager'].includes(rolePermission?.role?.name) && !rolePermission?.role?.org_id) {
    const roles = await roleHelper.getRoles(
      { where: { name: rolePermission?.role?.name || null, org_id: { [Op.ne]: null } } },
      transaction
    )

    await RolePermissionEntity.update(inputData, {
      transaction,
      where: {
        id: { [Op.ne]: rolePermission.id },
        permission_id: rolePermission.permission_id,
        role_id: { [Op.in]: roles.map((role) => role?.id) },
        updated_by: null
      }
    })
  }

  return rolePermission
}
