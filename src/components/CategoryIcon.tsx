import { Icon, type IconName } from "@/components/Icon";

export function CategoryIcon({ label, size = 22 }: { label: string; size?: number }) {
  const name: IconName = label.startsWith("Tub")
    ? "wheat"
    : label.startsWith("Fr")
      ? "leaf"
      : label.startsWith("Gra")
        ? "grid"
        : "sprout";

  return <Icon name={name} size={size} strokeWidth={1.7} />;
}
