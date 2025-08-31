// Entities
import { syncEntitiesIntoDatabase } from 'src/modules/entities'

// Seeders
import { seedAuthTemplates } from 'src/utils/seed/auth-template.seed'
import { seedRoles } from 'src/utils/seed/role.seed'
import { seedTestUser } from 'src/utils/seed/user.seed'

export const startDBSetupForTesting = async (req, res, next) => {
  try {
    await syncEntitiesIntoDatabase()
    await seedAuthTemplates()
    const roles = await seedRoles()
    await seedTestUser(roles)

    res.status(200).json({ message: 'SUCCESS' })
  } catch (error) {
    next(error)
  }
}

export { seedAuthTemplates, seedRoles }
