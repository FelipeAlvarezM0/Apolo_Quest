export const colors = {
  dark: {
    background: {
      app: '#070b14',
      sidebar: '#0b1220',
      panel: '#0f1727',
      elevated: '#152034',
      input: '#101b2d',
      hover: '#1a2740',
    },
    border: {
      default: '#2a3a57',
      subtle: '#1c2a45',
      focus: '#38bdf8',
    },
    text: {
      primary: '#e6edf7',
      secondary: '#bccae0',
      muted: '#8193b3',
      placeholder: '#617293',
    },
    accent: {
      primary: '#14b8a6',
      hover: '#2dd4bf',
      active: '#0d9488',
    },
    status: {
      success: '#22c55e',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#38bdf8',
    },
    method: {
      get: '#22c55e',
      post: '#38bdf8',
      put: '#f59e0b',
      patch: '#fb7185',
      delete: '#ef4444',
      options: '#a3a3a3',
      head: '#a78bfa',
    },
  },
  light: {
    background: {
      app: '#edf2fb',
      sidebar: '#f7f9ff',
      panel: '#ffffff',
      elevated: '#f2f6ff',
      input: '#f5f8ff',
      hover: '#e8efff',
    },
    border: {
      default: '#c8d6f0',
      subtle: '#dde6f7',
      focus: '#0284c7',
    },
    text: {
      primary: '#0f1b32',
      secondary: '#2f4366',
      muted: '#5d7297',
      placeholder: '#7688aa',
    },
    accent: {
      primary: '#0891b2',
      hover: '#06b6d4',
      active: '#0e7490',
    },
    status: {
      success: '#16a34a',
      error: '#dc2626',
      warning: '#d97706',
      info: '#0284c7',
    },
    method: {
      get: '#16a34a',
      post: '#0284c7',
      put: '#d97706',
      patch: '#e11d48',
      delete: '#dc2626',
      options: '#6b7280',
      head: '#7c3aed',
    },
  },
};

export const typography = {
  fontFamily: {
    sans: 'Sora, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    mono: '"IBM Plex Mono", "JetBrains Mono", "Fira Code", Consolas, monospace',
  },
  fontSize: {
    xs: '0.6875rem',
    sm: '0.8125rem',
    base: '0.875rem',
    md: '0.9375rem',
    lg: '1rem',
    xl: '1.125rem',
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
    code: '1.6',
  },
};

export const spacing = {
  base: '4px',
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px',
};

export const animation = {
  duration: {
    fast: '120ms',
    normal: '180ms',
    slow: '300ms',
  },
  easing: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
  },
};

export const borderRadius = {
  sm: '4px',
  md: '6px',
  lg: '8px',
  full: '9999px',
};

export type Theme = 'dark' | 'light';
export type MethodType = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'HEAD';

export const getMethodColor = (method: MethodType, theme: Theme = 'dark'): string => {
  return colors[theme].method[method.toLowerCase() as keyof typeof colors.dark.method];
};
