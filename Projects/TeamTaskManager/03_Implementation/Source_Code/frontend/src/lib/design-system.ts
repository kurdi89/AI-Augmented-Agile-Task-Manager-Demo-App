// Design System - Team Task Manager
// Primary Color: Indigo (#4F46E5) - Professional, trustworthy, modern
// Secondary Colors: Supporting palette for different states and components

export const colors = {
  // Primary Brand Colors
  primary: {
    50: '#EEF2FF',
    100: '#E0E7FF',
    200: '#C7D2FE',
    300: '#A5B4FC',
    400: '#818CF8',
    500: '#6366F1', // Main brand color
    600: '#4F46E5', // Primary button, links
    700: '#4338CA',
    800: '#3730A3',
    900: '#312E81',
  },
  
  // Neutral Colors
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  
  // Status Colors
  success: {
    50: '#F0FDF4',
    500: '#22C55E',
    600: '#16A34A',
  },
  
  warning: {
    50: '#FFFBEB',
    500: '#F59E0B',
    600: '#D97706',
  },
  
  error: {
    50: '#FEF2F2',
    500: '#EF4444',
    600: '#DC2626',
  },
  
  info: {
    50: '#EFF6FF',
    500: '#3B82F6',
    600: '#2563EB',
  },
};

export const spacing = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
  '3xl': '4rem',   // 64px
};

export const borderRadius = {
  sm: '0.25rem',   // 4px
  md: '0.375rem',  // 6px
  lg: '0.5rem',    // 8px
  xl: '0.75rem',   // 12px
  '2xl': '1rem',   // 16px
  full: '9999px',
};

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
};

// Component-specific styles
export const authStyles = {
  container: 'min-h-screen bg-gradient-to-br from-indigo-50 to-indigo-100 flex items-center justify-center p-4',
  card: 'w-full max-w-md shadow-xl bg-white rounded-xl',
  header: 'text-center',
  iconContainer: 'mx-auto mb-4 w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center',
  title: 'text-2xl font-bold text-gray-900',
  description: 'text-gray-600',
  input: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500',
  button: {
    primary: 'w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors',
    secondary: 'w-full border border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-medium py-2 px-4 rounded-lg transition-colors',
    demo: 'w-full border border-green-200 text-green-700 hover:bg-green-50 font-medium py-2 px-4 rounded-lg transition-colors',
  },
  link: 'text-indigo-600 hover:text-indigo-500 font-medium',
  error: 'bg-red-50 border border-red-200 rounded-lg p-3',
  errorText: 'text-sm text-red-600',
};

export const dashboardStyles = {
  header: 'bg-white shadow-sm border-b border-gray-200',
  sidebar: 'bg-white shadow-lg border-r border-gray-200',
  card: 'bg-white rounded-lg shadow-md border border-gray-200',
  button: {
    primary: 'bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors',
  },
}; 