interface PermissionConfigInterface {
  roles: Array<rolePayload>;
  defaultRoutes?: Array<RoutePayloadInterface>;
  modules: Array<ModulesPayloadInterface>;
}

interface rolePayload {
  id: number;
  name: string;
  description: string;
}

export enum MethodList {
  GET = 'get',
  POST = 'post',
  PUT = 'put',
  DELETE = 'delete',
  PATCH = 'patch',
  ANY = 'any',
  OPTIONS = 'options'
}

export interface RoutePayloadInterface {
  path: string;
  method: MethodList;
  resource?: string;
  description?: string;
  isDefault?: boolean;
}

export interface ModulesPayloadInterface {
  name: string;
  resource: string;
  hasSubmodules: boolean;
  route?: string;
  submodules?: Array<SubModulePayloadInterface>;
  permissions?: Array<PermissionPayload>;
}

export interface SubModulePayloadInterface {
  name: string;
  resource?: string;
  route?: string;
  permissions?: Array<PermissionPayload>;
}

export interface PermissionPayload {
  name: string;
  resource?: string;
  route: Array<RoutePayloadInterface>;
}

export const PermissionConfiguration: PermissionConfigInterface = {
  roles: [
    {
      id: 1,
      name: 'Super Admin',
      description: 'superuser of the system'
    },
    {
      id: 2,
      name: 'Normal User',
      description: 'normal user of the system'
    }
  ],
  defaultRoutes: [
    {
      path: '/check',
      method: MethodList.GET
    },
    {
      path: '/auth/register',
      method: MethodList.POST
    },
    {
      path: '/auth/login',
      method: MethodList.POST
    },
    {
      path: '/auth/profile',
      method: MethodList.GET
    },
    {
      path: '/auth/activate-account',
      method: MethodList.GET
    },
    {
      path: '/auth/forgot-password',
      method: MethodList.PUT
    },
    {
      path: '/auth/reset-password',
      method: MethodList.PUT
    },
    {
      path: '/auth/change-password',
      method: MethodList.PUT
    },
    {
      path: '/auth/profile',
      method: MethodList.PUT
    },
    {
      path: '/revoke/:id',
      method: MethodList.PUT
    },
    {
      path: '/auth/token-info',
      method: MethodList.GET
    },
    {
      path: '/dashboard',
      method: MethodList.GET
    },
    {
      path: '/dashboard/users',
      method: MethodList.GET
    },
    {
      path: '/dashboard/os',
      method: MethodList.GET
    },
    {
      path: '/dashboard/browser',
      method: MethodList.GET
    },
    {
      path: '/logout',
      method: MethodList.POST
    }
  ],

  modules: [
    {
      name: 'Admin Management',
      resource: 'user',
      hasSubmodules: false,
      permissions: [
        {
          name: 'View All Admins',
          route: [
            {
              path: '/users',
              method: MethodList.GET
            }
          ]
        },
        {
          name: 'Create Admin',
          route: [
            {
              path: '/users',
              method: MethodList.POST
            }
          ]
        },
        {
          name: 'View Admin',
          route: [
            {
              path: '/users/:id',
              method: MethodList.GET
            }
          ]
        },
        {
          name: "Reset Admin's Password",
          route: [
            {
              path: '/users/reset-password/:id',
              method: MethodList.PUT
            }
          ]
        },
        {
          name: 'Update Admin',
          route: [
            {
              path: '/users/:id',
              method: MethodList.PUT
            }
          ]
        },
        {
          name: 'Delete Admin',
          route: [
            {
              path: '/users/:id',
              method: MethodList.DELETE
            }
          ]
        }
      ]
    },
    {
      name: 'Role Management',
      resource: 'role',
      hasSubmodules: false,
      permissions: [
        {
          name: 'View All Roles',
          route: [
            {
              path: '/roles',
              method: MethodList.GET
            }
          ]
        },
        {
          name: 'Create Role',
          route: [
            {
              path: '/roles',
              method: MethodList.POST
            }
          ]
        },
        {
          name: 'View Role',
          route: [
            {
              path: '/roles/:id',
              method: MethodList.GET
            }
          ]
        },
        {
          name: "View Role's Users list",
          route: [
            {
              path: '/roles/:id/users',
              method: MethodList.GET
            }
          ]
        },

        {
          name: 'Update Role',
          route: [
            {
              path: '/roles/:id',
              method: MethodList.PUT
            }
          ]
        },
        {
          name: 'Update Role in Bulk',
          route: [
            {
              path: '/roles/bulk-update',
              method: MethodList.POST
            }
          ]
        },
        {
          name: 'Delete Role',
          route: [
            {
              path: '/roles/:id',
              method: MethodList.DELETE
            }
          ]
        }
      ]
    },
    {
      name: 'Permission Management',
      resource: 'permission',
      hasSubmodules: false,
      permissions: [
        {
          name: 'View all Permissions',
          route: [
            {
              path: '/permissions',
              method: MethodList.GET
            }
          ]
        },
        {
          name: 'Sync permission from config',
          route: [
            {
              path: '/permissions/sync',
              method: MethodList.POST
            }
          ]
        },
        {
          name: 'View permission by id',
          route: [
            {
              path: '/permissions/:id',
              method: MethodList.GET
            }
          ]
        },
        {
          name: 'Store new permission',
          route: [
            {
              path: '/permissions',
              method: MethodList.POST
            }
          ]
        },
        {
          name: 'Update permission by id',
          route: [
            {
              path: '/permissions/:id',
              method: MethodList.PUT
            }
          ]
        },
        {
          name: 'Delete permission by id',
          route: [
            {
              path: '/permissions/:id',
              method: MethodList.DELETE
            }
          ]
        }
      ]
    },
    {
      name: 'Deposits',
      resource: 'deposits',
      hasSubmodules: false,
      permissions: [
        {
          name: 'View all deposits',
          route: [
            {
              path: '/transaction/deposit',
              method: MethodList.GET
            }
          ]
        }
      ]
    },
    {
      name: 'Withdrawal',
      resource: 'withdrawal',
      hasSubmodules: false,
      permissions: [
        {
          name: 'View all Transactions',
          route: [
            {
              path: '/transaction',
              method: MethodList.GET
            }
          ]
        },
        {
          name: 'View all pending withdrawal',
          route: [
            {
              path: '/transaction/pending/withdrawal',
              method: MethodList.GET
            }
          ]
        },
        {
          name: 'Process Withdrawal',
          route: [
            {
              path: '/transaction/process/withdrawal',
              method: MethodList.POST
            }
          ]
        },
        {
          name: 'Verify Withdrawal',
          route: [
            {
              path: '/transaction/verify/withdrawal',
              method: MethodList.PATCH
            }
          ]
        },
        {
          name: 'View all withdrawal',
          route: [
            {
              path: '/transaction/withdrawal',
              method: MethodList.GET
            }
          ]
        }
      ]
    },
    {
      name: 'Email Templates',
      resource: 'emailTemplates',
      hasSubmodules: false,
      permissions: [
        {
          name: 'View all email templates',
          route: [
            {
              path: '/email-templates',
              method: MethodList.GET
            }
          ]
        },
        {
          name: 'View email template',
          route: [
            {
              path: '/email-templates/:id',
              method: MethodList.GET
            }
          ]
        },
        {
          name: 'Store new email templates',
          route: [
            {
              path: '/email-templates',
              method: MethodList.POST
            }
          ]
        },
        {
          name: 'Update email template',
          route: [
            {
              path: '/email-templates/:id',
              method: MethodList.PUT
            }
          ]
        },
        {
          name: 'Delete email template',
          route: [
            {
              path: '/email-templates/:id',
              method: MethodList.DELETE
            }
          ]
        }
      ]
    },
    {
      name: 'Frontend User Management',
      resource: 'frontendUser',
      hasSubmodules: false,
      permissions: [
        {
          name: 'View all Users',
          route: [
            {
              path: '/frontend-user',
              method: MethodList.GET
            }
          ]
        },

        {
          name: 'View user by id',
          route: [
            {
              path: '/frontend-user/:id',
              method: MethodList.GET
            }
          ]
        },
        {
          name: "View user's courts visited",
          route: [
            {
              path: '/frontend-user/:id/courts-visited',
              method: MethodList.GET
            }
          ]
        },
        {
          name: "View user's tokens earned",
          route: [
            {
              path: '/frontend-user/:id/tokens-earned',
              method: MethodList.GET
            }
          ]
        },
        {
          name: "View user's play history",
          route: [
            {
              path: '/frontend-user/:id/play-history',
              method: MethodList.GET
            }
          ]
        },
        {
          name: "View user's activity logs",
          route: [
            {
              path: '/frontend-user/:id/activity-logs',
              method: MethodList.GET
            }
          ]
        },
        {
          name: 'Export users',
          route: [
            {
              path: '/frontend-user/export',
              method: MethodList.GET
            }
          ]
        },
        {
          name: 'Disable/Enable user',
          route: [
            {
              path: '/frontend-user/disable/:id',
              method: MethodList.PATCH
            }
          ]
        },
        {
          name: "Reset user's password",
          route: [
            {
              path: '/frontend-user/reset-password/:id',
              method: MethodList.POST
            }
          ]
        }
      ]
    }
    // {
    //   name: 'Admin Activity Log Management',
    //   resource: 'adminActivityLogs',
    //   hasSubmodules: false,
    //   permissions: [
    //     {
    //       name: "View Admin's Activity Logs",
    //       route: [
    //         {
    //           path: '/admin-activity-logs',
    //           method: MethodList.GET
    //         }
    //       ]
    //     }
    //   ]
    // }
  ]
};
