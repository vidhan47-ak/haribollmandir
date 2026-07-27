"use client";

import {
  useCallback,
  type ComponentPropsWithoutRef,
  type MouseEvent,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { LotusLink, useLotusTransition } from "./LotusRouteTransition";

// The lotus route transition now lives in ./LotusRouteTransition. This module
// stays as a compatibility layer so existing imports keep working while every
// navigation flows through the single new provider/overlay.
export {
  LotusTransitionProvider,
  LotusLink,
} from "./LotusRouteTransition";

type NavigateFn = (href: string) => void;

/** Bridge: returns a navigate(href) that plays the lotus transition when both
 *  the current and target routes are in the provider's route set, else pushes. */
export function useLotusNavigate(): NavigateFn {
  const transition = useLotusTransition();
  const router = useRouter();
  return useCallback(
    (href: string) => {
      if (transition) transition.navigate(href);
      else router.push(href);
    },
    [transition, router],
  );
}

/** Drop-in link that plays the lotus transition; a thin wrapper over LotusLink
 *  so callers keep passing href/className/onClick/children unchanged. */
export function TransitionLink({
  href,
  onClick,
  children,
  ...rest
}: {
  href: string;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<"a">, "href" | "onClick">) {
  return (
    <LotusLink href={href} onClick={onClick} {...rest}>
      {children}
    </LotusLink>
  );
}
