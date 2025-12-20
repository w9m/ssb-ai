import clsx from 'classnames';
import React from 'react';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost';
};

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', className, ...props }) => {
  return <button className={clsx('btn', variant !== 'primary' && variant, className)} {...props} />;
};
