'use client'

import { useState } from 'react'
import { Field, Label, Input as HuiInput, Button as HuiButton, Description } from '@headlessui/react'
import type { ComponentPropsWithoutRef } from 'react'

interface InputProps extends ComponentPropsWithoutRef<'input'> {
  label?: string
  error?: string
}

export function Input({ label, error, type, id, className = '', ...props }: InputProps) {
  const [show, setShow] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword ? (show ? 'text' : 'password') : type

  return (
    <Field className="flex flex-col gap-1.5">
      {label && (
        <Label htmlFor={id} className="text-[13px] font-medium" style={{ color: 'var(--text2)' } as React.CSSProperties}>
          {label}
        </Label>
      )}

      <div className="relative">
        <HuiInput
          id={id}
          type={inputType}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={[
            'w-full rounded-lg border bg-[var(--bg)] px-3 py-2.5 text-sm text-[var(--text)] outline-none transition-colors',
            'placeholder:text-[var(--text3)]',
            'focus:ring-2',
            'data-[hover]:border-[var(--bg3)]',
            error
              ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
              : 'border-[var(--divider)] focus:border-[var(--accent)] focus:ring-[var(--accent-bg)]/40',
            isPassword ? 'pr-10' : '',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          {...props}
        />

        {isPassword && (
          <HuiButton
            type="button"
            onClick={() => setShow((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 data-[hover]:text-stone-600 focus:outline-none"
            aria-label={show ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            {show ? (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </HuiButton>
        )}
      </div>

      {error && (
        <Description id={`${id}-error`} className="text-xs text-red-500" role="alert">
          {error}
        </Description>
      )}
    </Field>
  )
}
