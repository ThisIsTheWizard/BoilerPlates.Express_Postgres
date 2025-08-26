import { Router } from 'express'

// Controllers
import { roleController } from 'src/modules/controllers'

// Middlewares
import { authorizer } from 'src/middlewares'

export const roleRouter = Router()

/**
 * @swagger
 * /roles:
 *   post:
 *     tags:
 *       - Roles
 *     summary: Create a new role
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 enum: [admin, developer, moderator, user]
 *             required:
 *               - name
 *     responses:
 *       201:
 *         description: Role created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Role'
 */
roleRouter.post('/', authorizer(), roleController.createARole)

/**
 * @swagger
 * /roles/{entity_id}:
 *   put:
 *     tags:
 *       - Roles
 *     summary: Update role by ID
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
 *               name:
 *                 type: string
 *                 enum: [admin, developer, moderator, user]
 *     responses:
 *       200:
 *         description: Role updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Role'
 */
roleRouter.put('/:entity_id', authorizer(), roleController.updateARole)

/**
 * @swagger
 * /roles/{entity_id}:
 *   delete:
 *     tags:
 *       - Roles
 *     summary: Delete role by ID
 *     parameters:
 *       - in: path
 *         name: entity_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Role deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Role'
 */
roleRouter.delete('/:entity_id', authorizer(), roleController.deleteARole)

/**
 * @swagger
 * /roles:
 *   get:
 *     tags:
 *       - Roles
 *     summary: Get all roles
 *     responses:
 *       200:
 *         description: A list of roles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Role'
 */
roleRouter.get('/', authorizer(), roleController.getRoles)

/**
 * @swagger
 * /roles/{entity_id}:
 *   get:
 *     tags:
 *       - Roles
 *     summary: Get role by ID
 *     parameters:
 *       - in: path
 *         name: entity_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Role object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Role'
 */
roleRouter.get('/:entity_id', authorizer(), roleController.getARole)
