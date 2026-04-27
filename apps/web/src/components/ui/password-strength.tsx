'use client'

interface PasswordStrengthProps {
  password: string
}

const rules = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'One uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'One number', test: (p: string) => /[0-9]/.test(p) },
  { label: 'One special character', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
]

export function PasswordStrength({ password }: PasswordStrengthProps) {
  if (!password) return null

  const passed = rules.filter((r) => r.test(password)).length
  const strengthLabel = ['Weak', 'Fair', 'Good', 'Strong'][passed - 1] ?? 'Weak'
  const strengthColor = [
    'bg-red-400',
    'bg-orange-400',
    'bg-yellow-400',
    'bg-green-500',
  ][passed - 1] ?? 'bg-red-400'

  return (
    <div className="space-y-2">
      {/* Strength bar */}
      <div className="flex items-center gap-2">
        <div className="flex flex-1 gap-1">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all ${
                i <= passed ? strengthColor : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
        <span className={`text-xs font-medium ${
          passed === 4 ? 'text-green-600' : passed >= 2 ? 'text-orange-500' : 'text-red-500'
        }`}>
          {strengthLabel}
        </span>
      </div>

      {/* Rules checklist */}
      <ul className="space-y-0.5">
        {rules.map((rule) => (
          <li key={rule.label} className="flex items-center gap-1.5 text-xs">
            {rule.test(password) ? (
              <svg className="h-3.5 w-3.5 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="h-3.5 w-3.5 text-gray-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <circle cx="12" cy="12" r="9" strokeWidth={2} />
              </svg>
            )}
            <span className={rule.test(password) ? 'text-gray-500' : 'text-gray-400'}>
              {rule.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
