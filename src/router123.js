module.exports = {
  basename: "window.APP_CONFIG.basename" || "", // 路由前缀
  loadingComponent: "@/components/Example/Loading", // 路由按需加载 loading组件
  useAuth: "@/hooks/useAuth", // 是否有权限
  noAuthShow: "@/components/Example/NoAuth", // 无权限展示效果
  routes: [
    {
      path: "/404", // 路径
      code: "44", // 唯一code，权限校验用，无code代办无权限
      exact: true, // 是否精确匹配
      dynamic: false, // 是否懒加载
      component: "@/pages/Example/Error",
    },
    {
      path: "/login",
      exact: true,
      component: "@/pages/Login",
    },
    {
      path: "/",
      component: "@/layouts/BasicLayout",
      dynamic: false,
      routes: [
        {
          icon: "dashboard",
          name: "仪表盘",
          path: "/homepage",
          component: "@/pages/Homepage",
        },
        {
          icon: "desktop",
          name: "主机管理",
          path: "/machine-management",
          component: "@/layouts/Child",
          routes: [
            {
              name: "主机列表",
              path: "/machine-management/list",
              component: "@/pages/MachineManagement",
            },
            // {
            //   name: "未使用",
            //   path: "/machine-management/unused",
            //   component: "@/pages/MachineManagement",
            // },
          ],
        },
        {
          icon: "cluster",
          name: "产品管理",
          path: "/products-management",
          component: "@/layouts/Child",
          routes: [
            {
              name: "版本管理",
              path: "/products-management/version",
              component: "@/pages/ProductsManagement/VersionManagement",
              routes: [
                {
                  name: "环境纳管",
                  path: "/products-management/version/upload",
                  component: "@/pages/ProductsManagement/VersionManagement/UploadFile",
                },
                {
                  name: "快速部署",
                  path: "/products-management/version/rapidDeployment",
                  component: "@/pages/ProductsManagement/VersionManagement/RapidDeployment",
                },
                {
                  name: "安装明细",
                  path: "/products-management/version/installationDetails",
                  component: "@/pages/ProductsManagement/VersionManagement/InstallationDetails",
                },
              ],
            },
            // {
            //   name: "环境纳管",
            //   path: "/products-management/upload",
            //   component: "@/pages/ProductsManagement/VersionManagement/UploadFile",
            // },
            {
              name: "服务管理",
              path: "/products-management/service",
              component: "@/pages/ProductsManagement/ServiceManagement",
            },
            // {
            //   name: "产品仓库",
            //   path: "/products-management/ProductWarehouse",
            //   component: "@/pages/ProductsManagement/ProductWarehouse",
            // }
            // {
            //   name: "快速部署",
            //   path: "",
            //   component: "",
            // },
          ],
        },
        {
          icon: "profile",
          name: "运维管理",
          path: "/operation-management",
          component: "@/layouts/Child",
          routes: [
            {
              name: "异常清单",
              path: "/operation-management/warnings",
              component: "@/pages/OperationManagement/WarningList",
            },
            {
              name: "告警记录",
              path: "/operation-management/waring-records",
              component: "@/pages/OperationManagement/WarningRecord",
            },
            {
              name: "自愈记录",
              path: "/operation-management/self-healing",
              component: "@/pages/OperationManagement/SelfHealing"
            },
            {
              name: "巡检报告",
              path: "/operation-management/report",
              component: "@/pages/OperationManagement/PatrolReport",
              routes: [
                {
                  name: "深度分析",
                  path: "/operation-management/report/deep",
                  component: "@/pages/Homepage",
                },
                {
                  name: "业务巡检",
                  path: "/operation-management/report/business",
                  component: "@/pages/Homepage",
                },
                {
                  name: "综合巡检",
                  path: "/operation-management/report/overall",
                  component: "@/pages/Homepage",
                },
                {
                  name: "主机巡检",
                  path: "/operation-management/report/machine",
                  component: "@/pages/Homepage",
                },
                {
                  name: "组件巡检",
                  path: "/operation-management/report/component",
                  component: "@/pages/Homepage",
                },
              ],
            },
            // {
            //   name: "趋势分析",
            //   path: "/operation-management/trend-analyze",
            //   component: "@/pages/OperationManagement/TrendAnalysis",
            // },
          ],
        },
        {
          icon: "solution",
          name: "操作记录",
          path: "/actions-record",
          component: "@/pages/ActionsRecord",
          routes: [
            {
              name: "登录日志",
              path: "/actions-record/login",
              component: "@/pages/ActionsRecord/LoginRecord",
            },
            {
              name: "系统记录",
              path: "/actions-record/system",
              component: "@/pages/ActionsRecord/SystemRecord",
            },
          ],
        },
        {
          icon: "setting",
          name: "系统设置",
          path: "/system-settings",
          component: "@/pages/SystemSettings",
          routes: [
            {
              name: "用户管理",
              path: "/system-settings/users",
              component: "@/pages/SystemSettings/UserManagement",
              routes: [
                {
                  name: "角色管理",
                  path: "/system-settings/users/roles",
                  component: "@/pages/Homepage",
                },
                {
                  name: "用户管理",
                  path: "/system-settings/users/users",
                  component: "@/pages/Example/Error",
                },
              ],
            },
            {
              name: "系统设置",
              path: "/system-settings/system",
              component: "@/pages/SystemSettings/SystemManagement",
              routes: [
                {
                  name: "巡检设置",
                  path: "/system-settings/system/patrol",
                  component: "@/pages/Homepage",
                },
                {
                  name: "告警阀值",
                  path: "/system-settings/system/warnings",
                  component: "@/pages/Example/Error",
                },
              ],
            },
          ],
        },
        //版本管理下的数据上传, 设置"Not shown in menu"不会在LeftMenu展示
        // {
        //   icon: "control",
        //   name: "Not shown in menu",
        //   path: "/productsManagement/version",
        //   component: "@/pages/ProductsManagement/VersionManagement/ProductSettings",
        //   routes: [
        //     {
        //       name: "数据上传",
        //       path: "/productsManagement/version/upload",
        //       component: "@/pages/ProductsManagement/VersionManagement/ProductSettings/UploadFile",
        //     },
        //   ],
        // },
        { from: "/", to: "/homepage" },
      ],
    },
  ],
};
