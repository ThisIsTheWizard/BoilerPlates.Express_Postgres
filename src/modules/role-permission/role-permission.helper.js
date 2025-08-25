import { isBoolean } from 'lodash'

// Entities
import { RolePermissionEntity } from 'src/modules/entities'

// Utils

export const getARolePermission = async (options, transaction) =>
  RolePermissionEntity.findOne({ ...options, transaction })

export const getRolePermissions = async (options, transaction) =>
  RolePermissionEntity.findAll({ ...options, transaction })

export const prepareRolePermissionQuery = (params = {}) => {
  const query = {}

  if (isBoolean(params?.can_do_the_action)) {
    query.can_do_the_action = params.can_do_the_action
  }

  return query
}
