import clsx from 'classnames';
import React from 'react';

type BadgeProps = React.HTMLAttributes<HTMLSpanElement>;

export const Badge: React.FC<BadgeProps> = ({ className, ...props }) => (
  <span className={clsx('badge', className)} {...props} />
);
