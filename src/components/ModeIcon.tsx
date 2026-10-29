import { Axe, Bomb, FlaskConical, Gem, Hammer, Heart, Shield, ShoppingCart, Sword, TrainFront, type LucideProps } from "lucide-react";

const map = {
  "diamond-smp": Gem, "lt-cart": ShoppingCart, "ht-cart": TrainFront, creeper: Bomb, uhc: Heart,
  sword: Sword, smp: Shield, axe: Axe, mace: Hammer, nethpot: FlaskConical,
} as const;

export function ModeIcon({ slug, ...p }: { slug: string } & LucideProps) {
  const I = map[slug as keyof typeof map] ?? Sword;
  return <I {...p} />;
}
