import { pick } from 'lodash'

// Entities
import { PermissionEntity } from 'src/modules/entities'

// Helpers
import { rolePermissionHelper } from 'src/modules/helpers'

// Utils
import { sequelize } from 'src/utils/database'

export const getAPermission = async (options, transaction) => PermissionEntity.findOne({ ...options, transaction })

export const getPermissions = async (options, transaction) => PermissionEntity.findAll({ ...options, transaction })

export const countPermissions = async (options, transaction) => PermissionEntity.count({ ...options, transaction })

export const getAdminCouponActions = () => [
  'can_view_coupon',
  'can_view_coupon_history',
  'can_create_coupon',
  'can_update_coupon',
  'can_delete_coupon'
]

export const getAdminOrganizationActions = () => [
  'can_view_organization',
  'can_create_organization',
  'can_reset_organization',
  'can_update_organization',
  'can_delete_organization'
]

export const getAdminPlanActions = () => [
  'can_create_plan',
  'can_update_plan',
  'can_delete_plan',
  'can_create_plan_feature',
  'can_update_plan_feature',
  'can_add_feature_to_plan',
  'can_remove_feature_from_plan'
]

export const getAdminRoleActions = () => [
  'can_view_admin_role',
  'can_view_organization_role',
  'can_update_app_admin_permission',
  'can_update_app_manager_permission'
]

export const getOrgArticleActions = () => [
  'can_view_article',
  'can_create_article',
  'can_update_article',
  'can_update_article_order',
  'can_update_article_status',
  'can_delete_article'
]

export const getOrgBrandActions = () => [
  'can_view_brand',
  'can_create_brand',
  'can_update_brand',
  'can_update_brand_status',
  'can_manage_custom_domain',
  'can_view_brand_setting',
  'can_update_brand_setting'
]

export const getOrgCannedResponseActions = () => [
  'can_create_canned_response',
  'can_view_canned_response',
  'can_update_canned_response',
  'can_delete_canned_response'
]

export const getOrgCategoryActions = () => [
  'can_view_category',
  'can_create_category',
  'can_update_category',
  'can_update_category_status',
  'can_update_category_order',
  'can_delete_category'
]

export const getOrgChangeLogActions = () => [
  'can_view_change_log',
  'can_create_change_log',
  'can_update_change_log',
  'can_publish_or_unpublish_change_log',
  'can_delete_change_log'
]

export const getOrgChannelActions = () => [
  'can_view_channel',
  'can_view_channel_email',
  'can_create_channel',
  'can_create_channel_email',
  'can_update_channel',
  'can_update_channel_email',
  'can_delete_channel',
  'can_delete_channel_email',
  'can_verify_custom_channel_email'
]

export const getOrgContactActions = () => [
  // Person contact
  'can_view_page_of_person_contact',
  'can_add_person_contact',
  'can_view_person_contact',
  'can_update_person_contact',
  'can_update_status_of_person_contact',
  'can_delete_person_contact',

  // Organization contact
  'can_view_page_of_organization_contact',
  'can_add_organization_contact',
  'can_view_organization_contact',
  'can_update_organization_contact',
  'can_update_status_of_organization_contact',
  'can_delete_organization_contact'
]

export const getOrgConversationActions = () => [
  'can_delete_conversation',
  'can_mark_or_unmark_as_resolved',
  'can_mark_or_unmark_as_spam',
  'can_reply_to_conversation',
  'can_update_conversation',
  'can_view_conversation'
]

export const getOrgDashboardActions = () => [
  'can_view_average_first_response_time_of_week',
  'can_view_new_ticket_count_graph_of_week',
  'can_view_priority_wise_ticket_count_of_week',
  'can_view_ticket_count_by_date_filter',
  'can_view_top_ticket_resolver_agent_of_month'
]

export const getOrgFeedbackActions = () => [
  'can_create_feedback',
  'can_view_all_feedback',
  'can_view_own_feedback',
  'can_update_all_feedback',
  'can_update_own_feedback',
  'can_react_to_a_feedback',
  'can_delete_all_feedback',
  'can_delete_own_feedback',
  'can_merge_feedback',
  'can_mark_or_unmark_as_spam',
  'can_add_feedback_comment',
  'can_mention_in_the_comment',
  'can_view_feedback_comment',
  'can_update_feedback_comment',
  'can_delete_feedback_comment'
]

export const getOrgFeedbackSettingActions = () => [
  'can_view_org_brand_group',
  'can_add_org_brand_group',
  'can_remove_org_brand_group'
]

export const getOrgFeedbackStageActions = () => [
  'can_view_feedback_stage',
  'can_create_feedback_stage',
  'can_update_feedback_stage',
  'can_delete_feedback_stage',
  'can_reorder_feedback_stages'
]

export const getOrgFeedbackStatusActions = () => [
  'can_view_feedback_status',
  'can_create_feedback_status',
  'can_update_feedback_status',
  'can_delete_feedback_status',
  'can_reorder_feedback_statuses'
]

export const getOrgFAQActions = () => [
  'can_view_frequently_asked_question',
  'can_create_frequently_asked_question',
  'can_update_frequently_asked_question',
  'can_update_frequently_asked_question_order',
  'can_delete_frequently_asked_question'
]

export const getOrgGroupActions = () => [
  'can_view_group',
  'can_create_group',
  'can_update_group',
  'can_update_group_manager',
  'can_view_agent_in_group',
  'can_add_agent_to_group',
  'can_update_agent_in_group',
  'can_remove_agent_from_group',
  'can_delete_group'
]

export const getOrgImportActions = () => ['can_view_import', 'can_start_new_import', 'can_delete_import']

export const getOrgMyProfileActions = () => ['can_view_associated_groups', 'can_view_my_activity_log']

export const getOrgNotificationActions = () => ['can_view_notification', 'can_mark_notification_as_seen']

export const getOrgPlanActions = () => [
  'can_purchase_plan',
  'can_change_plan',
  'can_cancel_plan',
  'can_view_org_subscription',
  'can_view_subscription_invoice',
  'can_download_subscription_invoice'
]

export const getOrgRoleActions = () => [
  'can_view_role',
  'can_view_permission',
  'can_update_admin_permission',
  'can_update_agent_permission',
  'can_update_collaborator_permission',
  'can_update_manager_permission',
  'can_update_owner_permission'
]

export const getOrgSectionActions = () => [
  'can_view_section',
  'can_create_section',
  'can_update_section',
  'can_update_section_order',
  'can_delete_section'
]

export const getOrgSettingActions = () => ['can_view_setting', 'can_update_setting']

export const getOrgSLAPolicyActions = () => ['can_view_sla_policy', 'can_update_sla_policy']

export const getOrgTagActions = () => ['can_view_tag', 'can_create_tag', 'can_delete_tag']

export const getOrgTemplateActions = () => [
  'can_create_template',
  'can_view_template',
  'can_update_template',
  'can_delete_template'
]

export const getOrgTeamStatusActions = () => ['can_view_team_status']

export const getOrgTicketActions = () => [
  'can_create_ticket',
  'can_view_all_ticket',
  'can_delete_all_ticket',
  'can_delete_spammed_ticket',
  'can_delete_trashed_ticket',
  'can_mark_or_unmark_as_spam',
  'can_merge_ticket',
  'can_split_ticket',
  'can_update_all_ticket_property',
  // For agent
  'can_view_all_ticket_under_agent_group',
  'can_delete_ticket_under_agent_group',
  'can_update_ticket_under_agent_group',
  // For manager
  'can_view_all_ticket_under_managerial_group',
  'can_delete_ticket_under_managerial_group',
  'can_update_ticket_under_managerial_group',
  // For collaborator
  'can_view_all_ticket_under_collaborator',
  'can_delete_ticket_under_collaborator',
  'can_update_ticket_under_collaborator',
  // Filter
  'can_add_filter',
  'can_view_filter',
  'can_update_filer',
  'can_delete_filter',
  // Reply
  'can_view_ticket_reply',
  'can_send_ticket_reply',
  // Note
  'can_add_ticket_note',
  'can_mention_in_the_note',
  'can_view_ticket_note',
  'can_update_ticket_note',
  'can_delete_ticket_note',
  // Collaborator
  'can_add_ticket_collaborator',
  'can_delete_ticket_collaborator',
  'can_view_ticket_collaborator',
  // Follower
  'can_add_ticket_follower',
  'can_delete_ticket_follower',
  'can_view_ticket_follower',
  // Timeline
  'can_view_ticket_timeline'
]

export const getOrgTicketAttributeActions = () => [
  'can_view_ticket_status',
  'can_view_ticket_state',
  'can_view_ticket_priority',
  'can_create_ticket_type',
  'can_view_ticket_type',
  'can_delete_ticket_type'
]

export const getOrgUserActions = () => [
  'can_view_org_owner',
  'can_view_org_admin',
  'can_view_org_group_manager',
  'can_view_org_agent',
  'can_view_org_collaborator',
  'can_invite_org_user',
  'can_delete_org_user',
  'can_manage_org_owner',
  'can_manage_org_admin',
  'can_manage_org_group_manager',
  'can_manage_org_agent',
  'can_manage_org_collaborator',
  'can_update_org_user_profile',
  'can_update_org_user_email',
  'can_update_org_user_role',
  'can_update_org_user_status'
]

export const getOrgWorkflowActions = () => [
  'can_view_workflow',
  'can_create_new_workflow',
  'can_update_workflow',
  'can_update_workflows_status',
  'can_update_workflows_order',
  'can_delete_workflow'
]

export const getOrgWidgetSettingActions = () => [
  'can_view_general_setting',
  'can_update_general_setting',
  'can_view_installation_step',
  'can_view_assign_channel_setting',
  'can_assign_channel_for_conversation',
  'can_remove_channel_for_conversation',
  'can_view_agent_auto_response_setting',
  'can_update_agent_auto_response_setting',
  'can_view_send_chat_transcript_setting',
  'can_update_send_chat_transcript_setting',
  'can_view_remove_app_branding_setting',
  'can_update_remove_app_branding_setting'
]

export const getActionEnumValues = () => [
  // Common for both admin and organization application
  'can_view_page',

  // Admin user
  'can_view_app_admin',
  'can_view_app_manager',
  'can_manage_app_admin',
  'can_manage_app_manager',
  'can_invite_app_user',
  'can_update_app_user_profile',
  'can_update_app_user_email',
  'can_update_app_user_status',
  'can_delete_app_user',

  // Plan for both admin and organization application
  'can_view_plan',
  'can_view_plan_feature',

  // My profile for both admin and organization application
  'can_view_my_profile',
  'can_update_my_profile',
  'can_update_email',
  'can_update_password',

  // Notification
  ...getOrgNotificationActions(),

  // Admin coupon
  ...getAdminCouponActions(),

  // Admin organizations
  ...getAdminOrganizationActions(),

  // Admin plan
  ...getAdminPlanActions(),

  // Admin role
  ...getAdminRoleActions(),

  // Organization article
  ...getOrgArticleActions(),

  // Organization brand
  ...getOrgBrandActions(),

  // Organization canned response
  ...getOrgCannedResponseActions(),

  // Organization category
  ...getOrgCategoryActions(),

  // Organization change log
  ...getOrgChangeLogActions(),

  // Organization channel
  ...getOrgChannelActions(),

  // Organization contact
  ...getOrgContactActions(),

  // Organization conversation
  ...getOrgConversationActions(),

  // Organization dashboard
  ...getOrgDashboardActions(),

  // Organization feedback
  ...getOrgFeedbackActions(),

  // Organization feedback setting
  ...getOrgFeedbackSettingActions(),

  // Organization feedback stage
  ...getOrgFeedbackStageActions(),

  // Organization feedback status
  ...getOrgFeedbackStatusActions(),

  // Organization frequently asked question
  ...getOrgFAQActions(),

  // Organization group
  ...getOrgGroupActions(),

  // Organization Import
  ...getOrgImportActions(),

  // My profile getOrganization actions
  ...getOrgMyProfileActions(),

  // Organization plan
  ...getOrgPlanActions(),

  // Organization role
  ...getOrgRoleActions(),

  // Organization section
  ...getOrgSectionActions(),

  // Organization setting
  ...getOrgSettingActions(),

  // Organization SLA policy
  ...getOrgSLAPolicyActions(),

  // Organization tag
  ...getOrgTagActions(),

  // Organization team status
  ...getOrgTeamStatusActions(),

  // Organization ticket
  ...getOrgTicketActions(),

  // Organization ticket attribute
  ...getOrgTicketAttributeActions(),

  // Organization template
  ...getOrgTemplateActions(),

  // Organization user
  ...getOrgUserActions(),

  // Organization workflow
  ...getOrgWorkflowActions(),

  // Organization widget setting
  ...getOrgWidgetSettingActions()
]

export const getModuleEnumValues = () => [
  // It is for only dynamic query. There will be no data in permission table with this module
  'no_module',

  // Admin application
  'app_user',
  'coupon',
  'organization',

  // Common for both admin and getOrganization application
  'dashboard',
  'plan',
  'my_profile',

  // Organization application
  'admin',
  'agent',
  'article',
  'brand',
  'canned_response',
  'category',
  'change_log',
  'channel',
  'contact',
  'conversation',
  'feedback',
  'feedback_setting',
  'feedback_stage',
  'feedback_status',
  'frequently_asked_question',
  'group',
  'import',
  'notification',
  'owner',
  'role',
  'section',
  'setting',
  'sla_policy',
  'tag',
  'team_status',
  'template',
  'ticket',
  'ticket_attribute',
  'user',
  'widget_setting',
  'workflow'
]

export const preparePermissionQuery = (params = {}, user = {}) => {
  const query = {}

  if (params?.action) query.action = params?.action
  if (params?.application) query.application = params?.application
  if (params?.module) query.module = params?.module

  if (user?.org_id) query.application = 'organization'

  return query
}

export const getPermissionsForQuery = async (params) => {
  const { options, query, user } = params || {}
  const { limit, offset, order } = options || {}

  const permissionQuery = preparePermissionQuery(query, user)
  const rolePermissionQuery = rolePermissionHelper.prepareRolePermissionQuery(query)

  const include = [
    {
      association: 'roles',
      attributes: [
        'id',
        'name',
        [sequelize.literal('"roles->role_permissions"."can_do_the_action"'), 'can_do_the_action'],
        [sequelize.literal('"roles->role_permissions"."id"'), 'role_permission_id'],
        [sequelize.literal('"roles->role_permissions"."scope"'), 'scope']
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
    where: permissionQuery
  })
  const filtered_rows = await countPermissions({ distinct: true, include, where: permissionQuery })
  const total_rows = await countPermissions({ where: pick(permissionQuery, ['application']) })

  return { data: JSON.parse(JSON.stringify(permissions)), meta_data: { filtered_rows, total_rows } }
}
