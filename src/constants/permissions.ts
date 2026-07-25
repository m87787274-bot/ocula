
import { UserRole } from '../../types';

export enum Permission {
  VIEW_DASHBOARD = 'view_dashboard',
  INITIATE_SCAN = 'initiate_scan',
  ACCESS_GMB_TOOLS = 'access_gmb_tools',
  COMPARE_ENTITIES = 'compare_entities',
  MANAGE_MISSIONS = 'manage_missions',
  VIEW_PRICING = 'view_pricing',
  VIEW_HELP = 'view_help',
  EDIT_SETTINGS = 'edit_settings',
  MANAGE_USERS = 'manage_users',
  MANAGE_BILLING = 'manage_billing',
  EXPORT_REPORT = 'export_report',
  VIEW_SWOT = 'view_swot',
  VIEW_KEYWORDS = 'view_keywords',
  VIEW_COMPETITORS = 'view_competitors',
  EDIT_CAMPAIGNS = 'edit_campaigns',
}

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: Object.values(Permission),
  [UserRole.ANALYST]: [
    Permission.VIEW_DASHBOARD,
    Permission.INITIATE_SCAN,
    Permission.ACCESS_GMB_TOOLS,
    Permission.COMPARE_ENTITIES,
    Permission.MANAGE_MISSIONS,
    Permission.VIEW_PRICING,
    Permission.VIEW_HELP,
    Permission.EDIT_SETTINGS,
    Permission.EXPORT_REPORT,
    Permission.VIEW_SWOT,
    Permission.VIEW_KEYWORDS,
    Permission.VIEW_COMPETITORS,
    Permission.EDIT_CAMPAIGNS,
  ],
  [UserRole.VIEWER]: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_PRICING,
    Permission.VIEW_HELP,
    Permission.VIEW_SWOT,
    Permission.VIEW_KEYWORDS,
    Permission.VIEW_COMPETITORS,
  ],
  [UserRole.USER]: [
    Permission.VIEW_DASHBOARD,
    Permission.INITIATE_SCAN,
    Permission.VIEW_PRICING,
    Permission.VIEW_HELP,
    Permission.EDIT_SETTINGS,
    Permission.VIEW_SWOT,
    Permission.VIEW_KEYWORDS,
    Permission.VIEW_COMPETITORS,
    Permission.EXPORT_REPORT,
    Permission.EDIT_CAMPAIGNS,
    Permission.MANAGE_MISSIONS,
  ],
};

export const hasPermission = (role: UserRole, permission: Permission): boolean => {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
};
