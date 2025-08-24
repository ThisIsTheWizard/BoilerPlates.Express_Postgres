// Packages
import { filter, isArray, pick, size } from 'lodash'
import { Op } from 'sequelize'

// Entities
import { RoleEntity } from 'src/modules/entities'

// Helpers
import { commonHelper } from 'src/modules/helpers'

// Utils
import { sequelize } from 'src/utils/database'
import { CustomError } from 'src/utils/error'

export const getARole = async (options, transaction) => RoleEntity.findOne({ ...options, transaction })

export const getRoles = async (options, transaction) => RoleEntity.findAll({ ...options, transaction })

export const countRoles = async (options) => RoleEntity.count(options)

export const getRolePermissionAssociation = (key = '', options = {}) => {
  const permissions = key ? `${key}->permissions->role_permissions` : 'permissions->role_permissions'

  return {
    ...options,
    association: 'permissions',
    attributes: [
      'id',
      'application',
      'action',
      'module',
      [sequelize.literal(`"${permissions}"."can_do_the_action"`), 'can_do_the_action'],
      [sequelize.literal(`"${permissions}"."id"`), 'role_permission_id'],
      [sequelize.literal(`"${permissions}"."scope"`), 'scope']
    ],
    through: { attributes: ['id', 'can_do_the_action', 'scope'] }
  }
}

export const prepareRoleQuery = (params = {}, user = {}) => {
  const roleQuery = {}

  const validateRoleViewingPermission = (name) => {
    if (!['admin', 'manager', 'user'].includes(name)) {
      commonHelper.validateUserPermission({
        action: `can_view_${name}`,
        module: 'user',
        permissions: user?.permissions || [],
        user_id: user?.user_id
      })
    }
  }

  if (params?.name) {
    if (!(user?.roles?.includes('admin') || user?.roles?.includes('manager')) && user?.org_id) {
      if (isArray(params.name)) {
        params.name.forEach(validateRoleViewingPermission)
      } else {
        validateRoleViewingPermission(params.name)
      }
    }
    roleQuery.name = params.name
  } else if (user?.org_id) {
    const roles = filter(
      [
        'org_owner',
        'org_admin',
        'org_group_manager',
        'org_agent',
        ...(!params?.exclude_org_collaborator ? ['org_collaborator'] : [])
      ],
      (name) =>
        user?.permissions?.user?.some(
          (userPermission) => userPermission?.action === `can_view_${name}` && userPermission?.can_do_the_action
        )
    )
    if (roles.length) roleQuery.name = roles
  } else {
    roleQuery.name = { [Op.notIn]: ['admin', 'manager', 'user', 'org_user'] }
  }

  if ((user?.roles?.includes('admin') || user?.roles?.includes('manager')) && params.org_id) {
    roleQuery.org_id = params.org_id
  } else roleQuery.org_id = user?.org_id || null

  return roleQuery
}

export const getARoleForQuery = async (params, user) => {
  const role = await getARole({
    include: [
      getRolePermissionAssociation(),
      { association: 'organization_users', attributes: ['id'], required: false }
    ],
    order: [
      ['permissions', 'module', 'ASC'],
      ['permissions', 'action', 'ASC']
    ],
    where: { id: params.entity_id, org_id: user?.org_id || null }
  })
  if (!role?.id) {
    throw new CustomError(404, 'ROLE_NOT_FOUND')
  }

  return JSON.parse(JSON.stringify(role))
}

export const getRolesForQuery = async (params) => {
  const { options, query, user } = params || {}
  const { limit, offset, order } = options || {}

  const roleQuery = prepareRoleQuery(query, user)
  const roles = await getRoles({
    include: user?.org_id
      ? [{ association: 'organization_users', attributes: ['id'], required: false }]
      : [{ association: 'app_users', attributes: ['id'], required: false }],
    limit,
    offset,
    order,
    where: roleQuery
  })

  const allRolesObj = { id: 'all_roles', name: 'all_roles' }
  if (user?.org_id) {
    allRolesObj.organization_users = await sequelize.query(
      `
        SELECT organization_users.id AS id FROM roles
        INNER JOIN role_users ON role_users.role_id=roles.id
        INNER JOIN organization_users ON organization_users.id=role_users.org_user_id
        WHERE roles.org_id='${user.org_id}'
        GROUP BY organization_users.id
      `,
      { type: sequelize.QueryTypes.SELECT }
    )
  } else {
    allRolesObj.app_users = await sequelize.query(
      `
        SELECT app_users.id AS id FROM roles
        INNER JOIN role_users ON role_users.role_id=roles.id
        INNER JOIN app_users ON app_users.id = role_users.app_user_id
        WHERE roles.org_id IS NULL
        GROUP BY app_users.id
      `,
      { type: sequelize.QueryTypes.SELECT }
    )
  }

  // Adding all roles to the list at the top
  roles.unshift(allRolesObj)

  const filtered_rows = await countRoles({ where: roleQuery })
  const total_rows = await countRoles({
    where: pick(roleQuery, user?.role === 'admin' ? ['name', 'org_id'] : ['org_id'])
  })

  return {
    data: JSON.parse(JSON.stringify(roles)),
    meta_data: { filtered_rows: filtered_rows + 1, total_rows: total_rows + 1 }
  }
}

export const getRoleUserIdsAndEmails = async (where, transaction) => {
  const includes = [{ association: 'users', attribute: ['id', 'email'] }]

  const roleUsers = await getRoles({ where, include: includes }, transaction)

  const user_emails = []
  const user_ids = []
  const role_users = []

  for (let i = 0; i < roleUsers.length; i++) {
    const { users = [] } = roleUsers[i]
    if (size(users)) {
      users.map((user) => {
        user_emails.push(user.email)
        user_ids.push(user.id)
        role_users.push(user)
      })
    }
  }

  return { user_emails, user_ids, users: role_users }
}
