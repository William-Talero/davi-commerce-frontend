import { cn } from '@/lib/utils'

describe('Utils', () => {
  describe('cn function', () => {
    it('combines class names correctly', () => {
      const result = cn('class1', 'class2', 'class3')
      expect(result).toBe('class1 class2 class3')
    })

    it('handles conditional classes', () => {
      const result = cn('base-class', true && 'conditional-class', false && 'hidden-class')
      expect(result).toBe('base-class conditional-class')
    })

    it('handles undefined and null values', () => {
      const result = cn('class1', undefined, null, 'class2')
      expect(result).toBe('class1 class2')
    })

    it('handles empty strings', () => {
      const result = cn('class1', '', 'class2')
      expect(result).toBe('class1 class2')
    })

    it('handles arrays of classes', () => {
      const result = cn(['class1', 'class2'], 'class3')
      expect(result).toBe('class1 class2 class3')
    })

    it('handles objects with boolean values', () => {
      const result = cn({
        'active': true,
        'inactive': false,
        'visible': true
      })
      expect(result).toBe('active visible')
    })

    it('merges Tailwind classes correctly (removes duplicates)', () => {
      const result = cn('px-4 py-2', 'px-6 py-2')
      // Should merge and keep the last px value
      expect(result).toContain('px-6')
      expect(result).toContain('py-2')
      expect(result).not.toContain('px-4')
    })

    it('handles complex Tailwind class merging', () => {
      const result = cn(
        'bg-red-500 text-white px-4 py-2',
        'bg-blue-500 px-6'
      )
      expect(result).toContain('bg-blue-500')
      expect(result).toContain('text-white')
      expect(result).toContain('px-6')
      expect(result).toContain('py-2')
      expect(result).not.toContain('bg-red-500')
      expect(result).not.toContain('px-4')
    })

    it('handles responsive classes', () => {
      const result = cn('text-sm md:text-lg', 'text-base lg:text-xl')
      expect(result).toContain('text-base')
      expect(result).toContain('md:text-lg')
      expect(result).toContain('lg:text-xl')
      expect(result).not.toContain('text-sm')
    })

    it('handles hover and focus states', () => {
      const result = cn(
        'bg-blue-500 hover:bg-blue-600',
        'hover:bg-blue-700 focus:bg-blue-800'
      )
      expect(result).toContain('bg-blue-500')
      expect(result).toContain('hover:bg-blue-700')
      expect(result).toContain('focus:bg-blue-800')
      expect(result).not.toContain('hover:bg-blue-600')
    })

    it('handles dark mode classes', () => {
      const result = cn(
        'bg-white text-black',
        'dark:bg-gray-800 dark:text-white'
      )
      expect(result).toBe('bg-white text-black dark:bg-gray-800 dark:text-white')
    })

    it('returns empty string for no arguments', () => {
      const result = cn()
      expect(result).toBe('')
    })

    it('handles single argument', () => {
      const result = cn('single-class')
      expect(result).toBe('single-class')
    })

    it('handles mixed argument types', () => {
      const result = cn(
        'base',
        ['array1', 'array2'],
        { 'conditional': true, 'hidden': false },
        undefined,
        'final'
      )
      expect(result).toBe('base array1 array2 conditional final')
    })

    it('handles variant-based class combinations', () => {
      const variant = 'primary'
      const size = 'lg'
      
      const result = cn(
        'button',
        variant === 'primary' && 'bg-blue-500 text-white',
        variant === 'secondary' && 'bg-gray-500 text-white',
        size === 'sm' && 'px-2 py-1 text-sm',
        size === 'lg' && 'px-6 py-3 text-lg'
      )
      
      expect(result).toBe('button bg-blue-500 text-white px-6 py-3 text-lg')
    })

    it('handles component prop-based classes', () => {
      const isDisabled = false
      const isActive = true
      const className = 'custom-class'
      
      const result = cn(
        'base-component',
        isDisabled && 'opacity-50 pointer-events-none',
        isActive && 'ring-2 ring-blue-500',
        className
      )
      
      expect(result).toBe('base-component ring-2 ring-blue-500 custom-class')
    })

    it('preserves important classes', () => {
      const result = cn('text-red-500', 'text-blue-500 !important')
      expect(result).toContain('text-blue-500')
      expect(result).toContain('!important')
    })

    it('handles arbitrary value classes', () => {
      const result = cn(
        'bg-[#1e40af]',
        'text-[14px]',
        'w-[calc(100%-2rem)]'
      )
      expect(result).toBe('bg-[#1e40af] text-[14px] w-[calc(100%-2rem)]')
    })
  })
})