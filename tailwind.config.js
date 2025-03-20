module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: theme('colors.primary'),
        success: theme('colors.success'),
        warning: theme('colors.warning'),
        danger: theme('colors.danger'),
        surface: {
          100: theme('colors.surface.100'),
          200: theme('colors.surface.200'),
          300: theme('colors.surface.300')
        }
      },
      spacing: {
        xs: theme('spacing.1'),
        sm: theme('spacing.2'),
        md: theme('spacing.4'),
        lg: theme('spacing.6')
      },
      borderRadius: {
        sm: theme('borderRadius.1'),
        md: theme('borderRadius.2'),
        lg: theme('borderRadius.4')
      }
    }
  },
  plugins: [],
  corePlugins: {
    preflight: false
  }
}