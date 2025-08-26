import { Router } from 'express'

// Controllers
import { roleUserController } from 'src/modules/controllers'

// Middlewares
import { authorizer } from 'src/middlewares'

export const roleUserRouter = Router()

/**
 * @swagger
 * /role-users:
 *   post:
 *     tags:
 *       - Role Users
 *     summary: Create a new role user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role_id:
 *                 type: string
 *                 format: uuid
 *               user_id:
 *                 type: string
 *                 format: uuid
 *             required:
 *               - role_id
 *               - user_id
 *     responses:
 *       201:
 *         description: Role user created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RoleUser'
 */
roleUserRouter.post('/', authorizer(), roleUserController.createARoleUser)

/**
 * @swagger
 * /role-users/{entity_id}:
 *   put:
 *     tags:
 *       - Role Users
 *     summary: Update role user by ID
 *     parameters:
 *       - in: path
 *         name: entity_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role_id:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Role user updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RoleUser'
 */
roleUserRouter.put('/:entity_id', authorizer(), roleUserController.updateARoleUser)

/**
 * @swagger
 * /role-users/{entity_id}:
 *   delete:
 *     tags:
 *       - Role Users
 *     summary: Delete role user by ID
 *     parameters:
 *       - in: path
 *         name: entity_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Role user deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RoleUser'
 */
roleUserRouter.delete('/:entity_id', authorizer(), roleUserController.deleteARoleUser)

/**
 * @swagger
 * /role-users:
 *   get:
 *     tags:
 *       - Role Users
 *     summary: Get all role users
 *     responses:
 *       200:
 *         description: A list of role users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/RoleUser'
 */
roleUserRouter.get('/', authorizer(), roleUserController.getRoleUsers)

/**
 * @swagger
 * /role-users/{entity_id}:
 *   get:
 *     tags:
 *       - Role Users
 *     summary: Get role user by ID
 *     parameters:
 *       - in: path
 *         name: entity_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Role user object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RoleUser'
 */
roleUserRouter.get('/:entity_id', authorizer(), roleUserController.getARoleUser)
