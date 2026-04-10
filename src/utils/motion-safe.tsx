import React from 'react';

const MOTION_PROP_KEYS = new Set([
  'animate',
  'exit',
  'initial',
  'layout',
  'layoutId',
  'transition',
  'whileHover',
  'whileTap',
  'whileInView',
  'viewport',
  'variants',
  'drag',
  'dragConstraints',
  'dragElastic',
  'dragMomentum',
  'onAnimationStart',
  'onAnimationComplete'
]);

const componentCache = new Map<string, React.ForwardRefExoticComponent<any>>();

const createMotionComponent = (tagName: string) => {
  if (componentCache.has(tagName)) {
    return componentCache.get(tagName)!;
  }

  const MotionComponent = React.forwardRef<any, Record<string, unknown>>(({ children, ...props }, ref) => {
    const passthroughProps: Record<string, unknown> = {};

    Object.entries(props).forEach(([key, value]) => {
      if (!MOTION_PROP_KEYS.has(key)) {
        passthroughProps[key] = value;
      }
    });

    return React.createElement(tagName, { ...passthroughProps, ref }, children as React.ReactNode);
  });

  MotionComponent.displayName = `MotionSafe(${tagName})`;
  componentCache.set(tagName, MotionComponent);
  return MotionComponent;
};

export const motion = new Proxy(
  {},
  {
    get: (_, tagName: string) => createMotionComponent(tagName)
  }
) as Record<string, React.ForwardRefExoticComponent<any>>;

export const AnimatePresence: React.FC<{ children?: React.ReactNode }> = ({ children }) => <>{children}</>;
