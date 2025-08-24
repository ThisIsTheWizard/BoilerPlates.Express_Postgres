import { RolePermissionEntity } from 'src/modules/entities'

export const getARolePermission = async (options, transaction) =>
  RolePermissionEntity.findOne({ ...options, transaction })

export const getRolePermissions = async (options, transaction) =>
  RolePermissionEntity.findAll({ ...options, transaction })

export const prepareRolePermissionQuery = (params = {}) => {
  const query = {}

  if (params?.hasOwnProperty?.('can_do_the_action')) query.can_do_the_action = params?.can_do_the_action
  if (params?.scope) query.scope = params?.scope

  return query
}
