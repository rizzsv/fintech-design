'use client';

import React, { useRef } from 'react';
import { cva } from 'class-variance-authority';
import { motion, useMotionValue, useSpring, useTransform, type MotionValue, type MotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

const DEFAULT_SIZE = 40;
const DEFAULT_MAGNIFICATION = 60;
const DEFAULT_DISTANCE = 140;

const dockVariants = cva(
  'flex items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-2 backdrop-blur-md',
);

interface DockProps extends React.HTMLAttributes<HTMLDivElement> {
  iconSize?: number;
  iconMagnification?: number;
  disableMagnification?: boolean;
  iconDistance?: number;
  direction?: 'horizontal' | 'vertical';
  children: React.ReactNode;
}

interface DockIconProps extends Omit<MotionProps & React.HTMLAttributes<HTMLDivElement>, 'children'> {
  size?: number;
  magnification?: number;
  disableMagnification?: boolean;
  distance?: number;
  mousePosition?: MotionValue<number>;
  axis?: 'x' | 'y';
  className?: string;
  children?: React.ReactNode;
}

const DockIcon = ({
  size = DEFAULT_SIZE,
  magnification = DEFAULT_MAGNIFICATION,
  disableMagnification = false,
  distance = DEFAULT_DISTANCE,
  mousePosition,
  axis = 'x',
  className,
  children,
  ...props
}: DockIconProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const defaultMousePosition = useMotionValue(Infinity);
  const position = mousePosition ?? defaultMousePosition;
  const distanceFromCenter = useTransform(position, (value) => {
    const bounds = ref.current?.getBoundingClientRect();
    if (!bounds) return Infinity;

    const center = axis === 'y' ? bounds.top + bounds.height / 2 : bounds.left + bounds.width / 2;
    return value - center;
  });
  const targetSize = disableMagnification ? size : magnification;
  const sizeTransform = useTransform(distanceFromCenter, [-distance, 0, distance], [size, targetSize, size]);
  const scaleSize = useSpring(sizeTransform, { mass: 0.1, stiffness: 150, damping: 12 });
  const padding = Math.max(6, size * 0.2);

  return (
    <motion.div
      ref={ref}
      style={{ width: scaleSize, height: scaleSize, padding }}
      className={cn('flex aspect-square cursor-pointer items-center justify-center rounded-xl', className)}
      {...props}
    >
      {children}
    </motion.div>
  );
};

const Dock = React.forwardRef<HTMLDivElement, DockProps>(
  (
    {
      className,
      children,
      iconSize = DEFAULT_SIZE,
      iconMagnification = DEFAULT_MAGNIFICATION,
      disableMagnification = false,
      iconDistance = DEFAULT_DISTANCE,
      direction = 'horizontal',
      ...props
    },
    ref,
  ) => {
    const mousePosition = useMotionValue(Infinity);
    const isVertical = direction === 'vertical';

    return (
      <motion.div
        ref={ref}
        onMouseMove={(event) => mousePosition.set(isVertical ? event.clientY : event.clientX)}
        onMouseLeave={() => mousePosition.set(Infinity)}
        className={cn(dockVariants(), isVertical ? 'h-max flex-col' : 'w-max flex-row', className)}
        {...props}
      >
        {React.Children.map(children, (child) => {
          if (React.isValidElement<DockIconProps>(child) && child.type === DockIcon) {
            return React.cloneElement(child, {
              mousePosition,
              size: iconSize,
              magnification: iconMagnification,
              disableMagnification,
              distance: iconDistance,
              axis: isVertical ? 'y' : 'x',
            });
          }
          return child;
        })}
      </motion.div>
    );
  },
);

Dock.displayName = 'Dock';
DockIcon.displayName = 'DockIcon';

export { Dock, DockIcon, dockVariants };