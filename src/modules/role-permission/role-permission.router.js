import { Router } from 'express'

// Controllers
import { rolePermissionController } from 'src/modules/controllers'

// Middlewares
import { authorizer } from 'src/middlewares'

export const rolePermissionRouter = Router()

/**
 * @swagger
 * /role-permissions:
 *   post:
 *     tags:
 *       - Role Permissions
 *     summary: Create a new role permission
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
 *               permission_id:
 *                 type: string
 *                 format: uuid
 *               can_do_the_action:
 *                 type: boolean
 *             required:
 *               - role_id
 *               - permission_id
 *               - can_do_the_action
 *     responses:
 *       201:
 *         description: Role permission created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RolePermission'
 */
rolePermissionRouter.post('/', authorizer(), rolePermissionController.createARolePermission)

/**
 * @swagger
 * /role-permissions/{entity_id}:
 *   put:
 *     tags:
 *       - Role Permissions
 *     summary: Update role permission by ID
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
 *               can_do_the_action:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Role permission updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RolePermission'
 */
rolePermissionRouter.put('/:entity_id', authorizer(), rolePermissionController.updateARolePermission)

/**
 * @swagger
 * /role-permissions/{entity_id}:
 *   delete:
 *     tags:
 *       - Role Permissions
 *     summary: Delete role permission by ID
 *     parameters:
 *       - in: path
 *         name: entity_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Role permission deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RolePermission'
 */
rolePermissionRouter.delete('/:entity_id', authorizer(), rolePermissionController.deleteARolePermission)

/**
 * @swagger
 * /role-permissions:
 *   get:
 *     tags:
 *       - Role Permissions
 *     summary: Get all role permissions
 *     responses:
 *       200:
 *         description: A list of role permissions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/RolePermission'
 */
rolePermissionRouter.get('/', authorizer(), rolePermissionController.getRolePermissions)

/**
 * @swagger
 * /role-permissions/{entity_id}:
 *   get:
 *     tags:
 *       - Role Permissions
 *     summary: Get role permission by ID
 *     parameters:
 *       - in: path
 *         name: entity_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Role permission object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RolePermission'
 */
rolePermissionRouter.get('/:entity_id', authorizer(), rolePermissionController.getARolePermission)
