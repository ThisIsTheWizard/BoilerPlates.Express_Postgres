// Entities
import { PermissionEntity } from 'src/modules/entities'

// Helpers
import { commonHelper, rolePermissionHelper } from 'src/modules/helpers'

// Utils
import { sequelize } from 'src/utils/database'

export const getAPermission = async (options, transaction) => PermissionEntity.findOne({ ...options, transaction })

export const getPermissions = async (options, transaction) => PermissionEntity.findAll({ ...options, transaction })

export const countPermissions = async (options, transaction) => PermissionEntity.count({ ...options, transaction })

export const preparePermissionQuery = (params = {}) => {
  const query = {}

  if (params?.action) query.action = params?.action
  if (params?.module) query.module = params?.module

  return query
}

export const getAPermissionForQuery = async (query) => {
  commonHelper.validateRequiredProps(['entity_id'], query)

  return getAPermission({ attributes: ['id', 'action', 'module'], where: { id: query.entity_id } })
}

export const getPermissionsForQuery = async (params) => {
  const { options, query, user } = params || {}
  const { limit, offset, order } = options || {}

  const where = preparePermissionQuery(query)
  const rolePermissionQuery = rolePermissionHelper.prepareRolePermissionQuery(query)

  const include = [
    {
      association: 'roles',
      attributes: [
        'id',
        'name',
        [sequelize.literal('"roles->role_permissions"."can_do_the_action"'), 'can_do_the_action'],
        [sequelize.literal('"roles->role_permissions"."id"'), 'role_permission_id']
      ],
      through: { attributes: ['id', 'can_do_the_action', 'scope'], where: rolePermissionQuery },
      where: { org_id: user?.org_id || null }
    }
  ]
  const permissions = await getPermissions({
    include,
    limit,
    offset,
    order,
    where
  })
  const filtered_rows = await countPermissions({ distinct: true, include, where })
  const total_rows = await countPermissions({ where: {} })

  return { data: JSON.parse(JSON.stringify(permissions)), meta_data: { filtered_rows, total_rows } }
}
