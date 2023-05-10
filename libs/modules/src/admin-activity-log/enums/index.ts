export enum MessageEnum {
  LOGGED_IN = 'has logged in',
  LOGGED_OUT = 'has logged out',
  CREATED_ADMIN = 'has created a new admin of id ',
  UPDATED_ADMIN = 'has updated an admin of id ',
  DELETED_ADMIN = 'has deleted an admin of id ',
  RESET_PASSWORD_ADMIN = 'reset the password for admin of id ',

  CREATED_ROLE = 'has created a new role of id ',
  UPDATED_ROLE = 'has updated a role of id ',
  BULK_UPDATED_ROLE = 'has bulk updated role of id ',
  DELETED_ROLE = 'has deleted a role of id ',

  UPDATED_EMAIL_TEMPLATE = 'has updated email template of id ',

  CREATED_COURT = 'has created a new court of id ',
  UPDATED_COURT = 'has updated a court of id ',
  DISABLED_COURT = 'has disabled a court of id ',
  ENABLED_COURT = 'has enabled a court of id ',
  DELETED_COURT_IMAGE = 'has deleted an image of court of id ',

  EXPORTED_USERS = 'has exported users',
  DISABLED_USERS = 'has disabled user of id ',
  ENABLED_USERS = 'has enabled user of id ',
  RESET_PASSWORD_USER = 'reset the password for user of id '
}

export enum ModuleEnum {
  COURT = 'Courts',
  ADMIN = 'Admins',
  USER = 'Users',
  EMAIL_TEMPLATE = 'Email Templates',
  ROLES_AND_PERMISSIONS = 'Roles & Permissions',
  LOG_IN = 'Log In',
  LOG_OUT = 'Log Out'
}

export enum TypeEnum {
  LOGGED_IN = 'logged-in',
  LOGGED_OUT = 'logged-out',
  CREATED_ADMIN = 'created-admin',
  UPDATED_ADMIN = 'updated-admin',
  DELETED_ADMIN = 'deleted-admin',
  RESET_PASSWORD_ADMIN = 'reset-password-admin',

  CREATED_ROLE = 'created-role',
  UPDATED_ROLE = 'updated-role',
  BULK_UPDATED_ROLE = 'bulk-updated-role',
  DELETED_ROLE = 'deleted-role',

  UPDATED_EMAIL_TEMPLATE = 'updated-email-template',

  CREATED_COURT = 'created-court',
  UPDATED_COURT = 'updated-court',
  DISABLED_COURT = 'disabled-court',
  ENABLED_COURT = 'enabled-court',
  DELETED_COURT_IMAGE = 'deleted-court-image',

  EXPORTED_USERS = 'exported-users',
  DISABLED_USERS = 'disabled-user',
  ENABLED_USERS = 'enabled-user',
  RESET_PASSWORD_USER = 'reset-password-user'
}
