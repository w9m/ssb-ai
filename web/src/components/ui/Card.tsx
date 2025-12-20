import clsx from 'classnames';
import React from 'react';

type CardProps = React.HTMLAttributes<HTMLDivElement>;

export const Card: React.FC<CardProps> = ({ className, ...props }) => (
  <div className={clsx('card', className)} {...props} />
);
