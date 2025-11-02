import ServiceManagement from "@/pages/ProductsManagement/ServiceManagement";
//import Echars from "@/pages/Echars/Ifame";
import WarningRecord from "@/pages/OperationManagement/WarningRecord";
import VersionManagement from "@/pages/ProductsManagement/VersionManagement";
import MachineManagement from "@/pages/MachineManagement"
import { DesktopOutlined, ClusterOutlined, ProfileOutlined } from "@ant-design/icons";
export default [
  {
    menuTitle: "主机管理",
    menuIcon: <DesktopOutlined />,
    menuKey: "/machine-management",
    children: [
      {
        title: "主机列表",
        path: "/machine-management/list",
        component: MachineManagement,
      },
    ],
  },
  {
    menuTitle: "产品管理",
    menuIcon: <ClusterOutlined />,
    menuKey: "/products-management",
    children: [
      {
        title: "服务管理",
        path: "/products-management/service",
        component: ServiceManagement,
      },
      {
        title: "版本管理",
        path: "/products-management/version",
        component: VersionManagement,
      },
    ],
  },
  {
    menuTitle: "运维管理",
    menuIcon: <ProfileOutlined />,
    menuKey: "/operation-management",
    children: [
      {
        title: "告警记录",
        path: "/operation-management/waring-records",
        component: WarningRecord ,
      },
    ],
  },
];
