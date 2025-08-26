import { pick } from 'lodash'
import { parse } from 'qs'

// Helpers
import { commonHelper, rolePermissionHelper } from 'src/modules/helpers'

// Services
import { rolePermissionService } from 'src/modules/services'

// Utils
import { useTransaction } from 'src/utils/database'

export const rolePermissionController = {}

rolePermissionController.getRolePermissions = async (req, res, next) => {
  try {
    const query = parse(req.query)
    const options = commonHelper.getOptionsFromQuery(query)
    const data = await rolePermissionHelper.getRolePermissionsForQuery(pick(query, ['entity_id']), options, req.user)

    res.status(200).json({ data, message: 'SUCCESS' })
  } catch (error) {
    next(error)
  }
}

rolePermissionController.getARolePermission = async (req, res, next) => {
  try {
    const data = await rolePermissionHelper.getARolePermissionForQuery(req.params, req.user)

    res.status(200).json({ data, message: 'SUCCESS' })
  } catch (error) {
    next(error)
  }
}

rolePermissionController.createARolePermission = async (req, res, next) => {
  try {
    const data = await useTransaction(async (transaction) =>
      rolePermissionService.createARolePermissionForMutation(req.body, req.user, transaction)
    )

    res.status(201).json({ data, message: 'SUCCESS' })
  } catch (error) {
    next(error)
  }
}

rolePermissionController.updateARolePermission = async (req, res, next) => {
  try {
    const data = await useTransaction(async (transaction) =>
      rolePermissionService.updateARolePermissionForMutation({ ...req.body, ...req.params }, req.user, transaction)
    )

    res.status(200).json({ data, message: 'SUCCESS' })
  } catch (error) {
    next(error)
  }
}

rolePermissionController.deleteARolePermission = async (req, res, next) => {
  try {
    const data = await useTransaction(async (transaction) =>
      rolePermissionService.deleteARolePermissionForMutation(req.params, req.user, transaction)
    )

    res.status(200).json({ data, message: 'SUCCESS' })
  } catch (error) {
    next(error)
  }
}
