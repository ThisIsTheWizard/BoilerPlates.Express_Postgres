// Entities
import { PermissionEntity } from 'src/modules/entities'

// Helpers
import {} from 'src/modules/helpers'

// Utils
import { CustomError } from 'src/utils/error'

export const createAPermission = async (data, options, transaction) =>
  PermissionEntity.create(data, { ...options, transaction })

export const createPermissions = async (data, options, transaction) =>
  PermissionEntity.bulkCreate(data, { ...options, transaction })

export const updateAPermission = async (options, data, transaction) => {
  const permission = await PermissionEntity.findOne({ ...options, transaction })
  if (!permission?.id) {
    throw new CustomError(404, 'PERMISSION_NOT_FOUND')
  }

  await permission.update(data, { transaction })

  return permission
}

export const deleteAPermission = async (options, transaction) => {
  const permission = await PermissionEntity.findOne({ ...options, transaction })
  if (!permission?.id) {
    throw new CustomError(404, 'PERMISSION_NOT_FOUND')
  }

  await permission.destroy({ transaction })

  return permission
}
