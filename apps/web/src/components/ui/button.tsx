'use client'

import { Button as HuiButton } from '@headlessui/react'
import type { ComponentPropsWithoutRef } from 'react'

interface ButtonProps extends ComponentPropsWithoutRef<'button'> {
  variant?: 'primary' | 'ghost'
  isLoading?: boolean
}

export function Button({
  variant = 'primary',
  isLoading,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ' +
    'focus:outline-none data-[focus]:ring-2 data-[focus]:ring-offset-2 ' +
    'data-[disabled]:pointer-events-none data-[disabled]:opacity-40'

  const variants = {
    primary:
      'bg-[var(--accent)] text-white data-[hover]:opacity-90 data-[active]:opacity-80 data-[focus]:ring-[var(--accent-bg)]',
    ghost:
      'border border-[var(--divider)] bg-[var(--bg)] text-[var(--text2)] data-[hover]:bg-[var(--bg2)] data-[active]:bg-[var(--bg3)] data-[focus]:ring-[var(--bg3)]',
  }

  return (
    <HuiButton
      disabled={disabled || isLoading}
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    >
      {isLoading && (
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </HuiButton>
  )
}
