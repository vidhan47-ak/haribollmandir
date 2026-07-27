"use client";

import { useEffect } from "react";
import { motionValue, type MotionValue } from "framer-motion";
import type { ScrollController, ScrollSnapshot } from "./types";

export interface ScrollMotionValues {
  readonly scrollY: MotionValue<number>;
  readonly progress: MotionValue<number>;
  readonly isScrolling: MotionValue<boolean>;
}

export function createScrollMotionValues(
  initialSnapshot?: ScrollSnapshot,
): ScrollMotionValues {
  return {
    scrollY: motionValue(initialSnapshot?.y ?? 0),
    progress: motionValue(initialSnapshot?.progress ?? 0),
    isScrolling: motionValue(initialSnapshot?.isScrolling ?? false),
  };
}

function publishSnapshot(
  values: ScrollMotionValues,
  snapshot: ScrollSnapshot,
) {
  values.scrollY.set(snapshot.y);
  values.progress.set(snapshot.progress);
  values.isScrolling.set(snapshot.isScrolling);
}

export interface ScrollMotionBridgeProps {
  readonly controller: ScrollController;
  readonly values: ScrollMotionValues;
}

/** Publishes controller snapshots imperatively without rendering per frame. */
export function ScrollMotionBridge({
  controller,
  values,
}: ScrollMotionBridgeProps) {
  useEffect(() => {
    publishSnapshot(values, controller.getSnapshot());
    return controller.subscribe((snapshot) => {
      publishSnapshot(values, snapshot);
    });
  }, [controller, values]);

  return null;
}
