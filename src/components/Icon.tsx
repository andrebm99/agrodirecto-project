import type { ReactNode, SVGProps } from "react";

export type IconName =
  | "arrow-left" | "arrow-right" | "cart" | "check" | "close" | "grid"
  | "heart" | "home" | "info" | "leaf" | "menu" | "minus" | "plus"
  | "refresh" | "search" | "settings" | "star" | "sprout" | "trash" | "user" | "warning" | "wheat";

const paths: Record<IconName, ReactNode> = {
  "arrow-left": <path d="m15 18-6-6 6-6M9 12h11" />,
  "arrow-right": <path d="M4 12h16m-6-6 6 6-6 6" />,
  cart: <><path d="M3 4h2l2.1 10.1a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 1.9-1.4L20 8H6" /><circle cx="9" cy="20" r="1" /><circle cx="17" cy="20" r="1" /></>,
  check: <path d="m5 12 4 4L19 6" />,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  grid: <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />,
  heart: <path d="M20.8 8.8c0 5.5-8.8 10.2-8.8 10.2S3.2 14.3 3.2 8.8A4.8 4.8 0 0 1 12 6.1a4.8 4.8 0 0 1 8.8 2.7Z" />,
  home: <path d="m3 10 9-7 9 7v10H3zM9 20v-6h6v6" />,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></>,
  leaf: <path d="M20 4C10 4 5 8 5 15c0 2.8 2.2 5 5 5 7 0 10-6 10-16ZM4 20c2.5-4.5 6.3-7.2 11-9" />,
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  minus: <path d="M5 12h14" />,
  plus: <path d="M12 5v14M5 12h14" />,
  refresh: <path d="M20 11a8 8 0 0 0-14.7-4L3 10m0-5v5h5M4 13a8 8 0 0 0 14.7 4L21 14m0 5v-5h-5" />,
  search: <><circle cx="11" cy="11" r="6.5" /><path d="m16 16 5 5" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M19 15a7.5 7.5 0 0 0 0-6M5 9a7.5 7.5 0 0 0 0 6M9 5a7.5 7.5 0 0 0 6 0M9 19a7.5 7.5 0 0 0 6 0" /></>,
  star: <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-2.9-5.6 2.9 1.1-6.2L3 9.6l6.2-.9L12 3Z" />,
  sprout: <><path d="M12 21V9" /><path d="M12 14c-4 0-7-2.5-7-7 4.5 0 7 2.5 7 7ZM12 11c0-4 2.5-7 7-7 0 4.5-2.5 7-7 7Z" /></>,
  trash: <><path d="M4 7h16M10 11v5M14 11v5M6 7l1 13h10l1-13M9 7V4h6v3" /></>,
  user: <><circle cx="12" cy="8" r="3.5" /><path d="M5 20a7 7 0 0 1 14 0" /></>,
  warning: <><path d="m12 3 9 16H3L12 3Z" /><path d="M12 9v4M12 16h.01" /></>,
  wheat: <><path d="M12 21V5" /><path d="M12 9C8 9 6 7 6 4c3 0 6 2 6 5ZM12 13c4 0 6-2 6-5-3 0-6 2-6 5ZM12 17c-4 0-6-2-6-5 3 0 6 2 6 5ZM12 5c4 0 6-2 6-5-3 0-6 2-6 5Z" /></>,
};

export function Icon({ name, size = 18, strokeWidth = 1.8, ...props }: SVGProps<SVGSVGElement> & { name: IconName; size?: number; strokeWidth?: number }) {
  return <svg {...props} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{paths[name]}</svg>;
}
