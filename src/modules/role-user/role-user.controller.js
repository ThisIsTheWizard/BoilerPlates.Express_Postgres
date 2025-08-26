import { pick } from 'lodash'
import { parse } from 'qs'

// Helpers
import { commonHelper, roleUserHelper } from 'src/modules/helpers'

// Services
import { roleUserService } from 'src/modules/services'

// Utils
import { useTransaction } from 'src/utils/database'

export const roleUserController = {}

roleUserController.getRoleUsers = async (req, res, next) => {
  try {
    const query = parse(req.query)
    const options = commonHelper.getOptionsFromQuery(query)
    const data = await roleUserHelper.getRoleUsersForQuery(pick(query, ['entity_id']), options, req.user)

    res.status(200).json({ data, message: 'SUCCESS' })
  } catch (error) {
    next(error)
  }
}

roleUserController.getARoleUser = async (req, res, next) => {
  try {
    const data = await roleUserHelper.getARoleUserForQuery(req.params, req.user)

    res.status(200).json({ data, message: 'SUCCESS' })
  } catch (error) {
    next(error)
  }
}

roleUserController.createARoleUser = async (req, res, next) => {
  try {
    const data = await useTransaction(async (transaction) =>
      roleUserService.createARoleUserForMutation(req.body, req.user, transaction)
    )

    res.status(201).json({ data, message: 'SUCCESS' })
  } catch (error) {
    next(error)
  }
}

roleUserController.updateARoleUser = async (req, res, next) => {
  try {
    const data = await useTransaction(async (transaction) =>
      roleUserService.updateARoleUserForMutation({ ...req.body, ...req.params }, req.user, transaction)
    )

    res.status(200).json({ data, message: 'SUCCESS' })
  } catch (error) {
    next(error)
  }
}

roleUserController.deleteARoleUser = async (req, res, next) => {
  try {
    const data = await useTransaction(async (transaction) =>
      roleUserService.deleteARoleUserForMutation(req.params, req.user, transaction)
    )

    res.status(200).json({ data, message: 'SUCCESS' })
  } catch (error) {
    next(error)
  }
}
