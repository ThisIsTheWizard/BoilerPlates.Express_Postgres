import { Router } from 'express'

// Controllers
import { permissionController } from 'src/modules/controllers'

// Middlewares
import { authorizer } from 'src/middlewares'

export const permissionRouter = Router()

/**
 * @swagger
 * /permissions:
 *   post:
 *     tags:
 *       - Permissions
 *     summary: Create a new permission
 *     security:
 *       - tokenAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [create, read, update, delete]
 *               module:
 *                 type: string
 *                 enum: [permission, role, role_permission, role_user, user]
 *             required:
 *               - action
 *               - module
 *     responses:
 *       201:
 *         description: SUCCESS
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Permission'
 */
permissionRouter.post('/', authorizer(), permissionController.createAPermission)

/**
 * @swagger
 * /permissions/{entity_id}:
 *   put:
 *     tags:
 *       - Permissions
 *     summary: Update permission by ID
 *     security:
 *       - tokenAuth: []
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
 *               action:
 *                 type: string
 *                 enum: [create, read, update, delete]
 *               module:
 *                 type: string
 *                 enum: [permission, role, role_permission, role_user, user]
 *     responses:
 *       200:
 *         description: SUCCESS
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Permission'
 */
permissionRouter.put('/:entity_id', authorizer(), permissionController.updateAPermission)

/**
 * @swagger
 * /permissions/{entity_id}:
 *   delete:
 *     tags:
 *       - Permissions
 *     summary: Delete permission by ID
 *     security:
 *       - tokenAuth: []
 *     parameters:
 *       - in: path
 *         name: entity_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: SUCCESS
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Permission'
 */
permissionRouter.delete('/:entity_id', authorizer(), permissionController.deleteAPermission)

/**
 * @swagger
 * /permissions:
 *   get:
 *     tags:
 *       - Permissions
 *     summary: Get all permissions
 *     security:
 *       - tokenAuth: []
 *     responses:
 *       200:
 *         description: SUCCESS
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Permission'
 */
permissionRouter.get('/', authorizer(), permissionController.getPermissions)

/**
 * @swagger
 * /permissions/{entity_id}:
 *   get:
 *     tags:
 *       - Permissions
 *     summary: Get permission by ID
 *     security:
 *       - tokenAuth: []
 *     parameters:
 *       - in: path
 *         name: entity_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: SUCCESS
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Permission'
 */
permissionRouter.get('/:entity_id', authorizer(), permissionController.getAPermission)
