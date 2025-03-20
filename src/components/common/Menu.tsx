import React from 'react';
import clsx from 'clsx';

type MenuVariant = 'surface' | 'primary' | 'dark';
type MenuSize = 'sm' | 'md' | 'lg';

export interface MenuItem {
  label: string;
  icon?: React.ReactNode;
  action?: () => void;
  children?: MenuItem[];
}

interface MenuProps {
  items: MenuItem[];
  variant?: MenuVariant;
  size?: MenuSize;
  className?: string;
  nested?: boolean;
}

const Menu: React.FC<MenuProps> = ({
  items,
  variant = 'surface',
  size = 'md',
  className,
  nested = false,
}) => {
  const MenuItemComponent = ({ label, icon, action, children }: MenuItem) => (
    <div
      className={clsx(
        'group relative',
        'transition-colors duration-200',
        {
          'px-4 py-2': size === 'md' && !nested,
          'px-3 py-1.5': size === 'sm' || nested,
          'text-sm': size === 'sm',
          'bg-[var(--surface-100)] hover:bg-[var(--surface-200)]': variant === 'surface',
          'bg-[var(--primary-600)] hover:bg-[var(--primary-700)]': variant === 'primary',
          'bg-gray-800 hover:bg-gray-700': variant === 'dark',
        }
      )}
    >
      <div
        className="flex items-center gap-2 cursor-pointer"
        onClick={action}
      >
        {icon && <span className="menu-icon">{icon}</span>}
        <span>{label}</span>
      </div>
      {children && children.length > 0 && (
        <div
          className={clsx(
            'absolute left-full top-0',
            'min-w-[200px]',
            'shadow-lg rounded-md',
            'opacity-0 invisible',
            'group-hover:opacity-100 group-hover:visible',
            'transition-opacity duration-150'
          )}
        >
          <Menu items={children} variant={variant} nested />
        </div>
      )}
    </div>
  );

  return (
    <div
      className={clsx(
        'menu-container',
        {
          'rounded-lg overflow-hidden': !nested,
          'p-1': nested,
        },
        className
      )}
    >
      {items.map((item, index) => (
        <MenuItemComponent key={index} {...item} />
      ))}
    </div>
  );
};

export default Menu;