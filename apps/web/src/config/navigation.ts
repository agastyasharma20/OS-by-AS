import { Activity, House, type LucideIcon } from "lucide-react";

/**
 * Navigation is data. Phase 5 replaces this static list with items filtered by the signed-in
 * user's roles and scopes (server-side); components only render what they are given.
 */
export type NavItem = {
  id: string;
  href: `/app${string}`;
  labelKey: `nav.${string}`;
  icon: LucideIcon;
};

export const NAV_ITEMS: readonly NavItem[] = [
  { id: "home", href: "/app", labelKey: "nav.home", icon: House },
  { id: "status", href: "/app/status", labelKey: "nav.status", icon: Activity },
];

export function isActive(pathname: string, href: string): boolean {
  return href === "/app"
    ? pathname === "/app"
    : pathname === href || pathname.startsWith(`${href}/`);
}

export function findNavItem(pathname: string): NavItem | undefined {
  return [...NAV_ITEMS].reverse().find((item) => isActive(pathname, item.href));
}
