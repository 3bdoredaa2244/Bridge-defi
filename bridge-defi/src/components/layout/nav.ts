import {
  ArrowDownToLine,
  ArrowUpFromLine,
  LayoutDashboard,
  ListOrdered,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  description: string;
}

export const NAV_ITEMS: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    description: "Portfolio overview",
  },
  {
    href: "/receive",
    label: "Receive",
    icon: ArrowDownToLine,
    description: "Show addresses & QR",
  },
  {
    href: "/send",
    label: "Send",
    icon: ArrowUpFromLine,
    description: "Sign & broadcast",
  },
  {
    href: "/transactions",
    label: "Transactions",
    icon: ListOrdered,
    description: "Activity history",
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
    description: "RPC & preferences",
  },
];
