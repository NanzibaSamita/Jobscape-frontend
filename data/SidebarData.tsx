import { ReactNode } from "react";
import { BriefcaseBusiness, Building2, FileStack, LayoutDashboard, Sparkles } from 'lucide-react';

const SidebarData: {
  id: number;
  name: string;
  hasSubmenu: boolean;
  expanded: boolean;
  icon: string | ReactNode; // Assuming icon is a string, you can change it to a React component type if needed
  route: string;
  for?: string[];
  subItemList?: {
    id: number;
    name: string;
    route: string;
    for?: string[];
  }[];
}[] = [
    // {
    //   id: 0,
    //   name: "Profile",
    //   hasSubmenu: false,
    //   expanded: false,
    //   icon: <UserPen size={20} />,
    //   // for: ["95", "90"],
    //   route: "/profile/update",
    //   subItemList: [
    //     // { id: 2, name: "Order List", route: "/order" },
    //     // { id: 3, name: "Order Item", route: "/order/item" },
    //     // { id: 1, name: "Dashboard", route: "/order/analytics" },
    //     // { id: 3, name: "Distributor Customer", route: "/distributor/customer" },
    //   ],
    // },
    {
      id: 1,
      name: "Dashboard",
      hasSubmenu: false,
      expanded: false,
      icon: <LayoutDashboard size={20} />,
      for: ["95"],
      route: "/dashboard",
      subItemList: [
        // { id: 2, name: "Order List", route: "/order" },
        // { id: 3, name: "Order Item", route: "/order/item" },
        // { id: 1, name: "Dashboard", route: "/order/analytics" },
        // { id: 3, name: "Distributor Customer", route: "/distributor/customer" },
      ],
    },
    {
      id: 2,
      name: "Scout",
      hasSubmenu: false,
      expanded: false,
      icon: <Sparkles size={20} />,
      for: ["95"],
      route: "/dashboard/candidates",
      subItemList: [

      ],
    },
    {
      id: 3,
      name: "Jobs",
      hasSubmenu: false,
      expanded: false,
      icon: <BriefcaseBusiness size={20} />,
      for: ["90"],
      route: "/jobs",
      subItemList: [

      ],
    },
    {
      id: 4,
      name: "Job Board",
      hasSubmenu: false,
      expanded: false,
      icon: <BriefcaseBusiness size={20} />,
      for: ["95"],
      route: "/dashboard/jobs",
      subItemList: [

      ],
    },
    {
      id: 5,
      name: "Companies",
      hasSubmenu: false,
      expanded: false,
      icon: <Building2 size={20} />,
      for: ["95"],
      route: "/companies",
      subItemList: [

      ],
    },
    {
      id: 6,
      name: "Applied Jobs",
      hasSubmenu: false,
      expanded: false,
      icon: <FileStack size={20} />,
      for: ["90"],
      route: "/applied-jobs",
      subItemList: [

      ],
    },

  ];

export default SidebarData;


