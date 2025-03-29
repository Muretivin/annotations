'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Icons } from './icons';

interface ToolButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  title: string;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  icon?: keyof typeof Icons;
}

const ToolButton = forwardRef<HTMLButtonElement, ToolButtonProps>(
  (
    {
      active = false,
      title,
      variant = 'ghost', // Default to ghost variant
      size = 'md',
      icon,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const IconComponent = icon ? Icons[icon] : null;
    
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-md transition-all duration-200 ease-in-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:pointer-events-none',
          'border-2', // Base border style
          {
            // Default variant
            'bg-gray-800 text-gray-100 hover:bg-gray-700 border-transparent':
              variant === 'default' && !active,
            'bg-gray-900 text-white border-blue-500 shadow-lg':
              variant === 'default' && active,
            
            // Ghost variant (now the default)
            'bg-transparent hover:bg-gray-800/30 text-gray-400 hover:text-gray-200 border-transparent':
              variant === 'ghost' && !active,
            'bg-gray-800/70 text-white border-blue-500 shadow-sm':
              variant === 'ghost' && active,
            
            // Outline variant
            'border-gray-600 bg-transparent hover:bg-gray-800/50 text-gray-300':
              variant === 'outline' && !active,
            'border-blue-500 bg-gray-800 text-white shadow-md':
              variant === 'outline' && active,
            
            // Sizes
            'p-1.5 text-sm gap-1': size === 'sm',
            'p-2 text-base gap-1.5': size === 'md',
            'p-3 text-lg gap-2': size === 'lg',
          },
          // Click effect
          'active:scale-95 active:border-blue-400',
          className
        )}
        aria-label={title}
        aria-pressed={active}
        title={title}
        {...props}
      >
        {IconComponent && (
          <IconComponent 
            className={cn('text-current transition-colors', {
              'w-4 h-4': size === 'sm',
              'w-5 h-5': size === 'md',
              'w-6 h-6': size === 'lg',
              'text-blue-300': active,
            })} 
          />
        )}
        {children}
      </button>
    );
  }
);

ToolButton.displayName = 'ToolButton';

export { ToolButton };