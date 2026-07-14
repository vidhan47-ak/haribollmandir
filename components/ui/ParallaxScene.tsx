import type { ReactNode } from "react";

interface ParallaxSceneProps {
  children: ReactNode;
  amount?: number;
  mobileAmount?: number;
}

export default function ParallaxScene({ children }: ParallaxSceneProps) {
  return <div className="parallax-main-scene">{children}</div>;
}
