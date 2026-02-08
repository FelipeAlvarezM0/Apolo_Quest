export const colors = {
  dark: {
    background: {
      app: '#1a1b1e',
      sidebar: '#1e1f22',
      panel: '#25262b',
      elevated: '#2c2d31',
      input: '#2c2d31',
      hover: '#2f3136',
    },
    border: {
      default: '#3a3b3f',
      subtle: '#2f3136',
      focus: '#4a90e2',
    },
    text: {
      primary: '#e8e9ed',
      secondary: '#b4b6bc',
      muted: '#71757d',
      placeholder: '#5a5d66',
    },
    accent: {
      primary: '#4a90e2',
      hover: '#5ba0f2',
      active: '#3a80d2',
    },
    status: {
      success: '#52c41a',
      error: '#ff4d4f',
      warning: '#faad14',
      info: '#1890ff',
    },
    method: {
      get: '#52c41a',
      post: '#1890ff',
      put: '#faad14',
      patch: '#9254de',
      delete: '#ff4d4f',
      options: '#13c2c2',
      head: '#722ed1',
    },
  },
  light: {
    background: {
      app: '#f5f5f5',
      sidebar: '#fafafa',
      panel: '#ffffff',
      elevated: '#f8f9fa',
      input: '#f8f9fa',
      hover: '#f0f0f0',
    },
    border: {
      default: '#d9d9d9',
      subtle: '#e8e8e8',
      focus: '#4a90e2',
    },
    text: {
      primary: '#1f2329',
      secondary: '#5a5d66',
      muted: '#8b8d94',
      placeholder: '#b4b6bc',
    },
    accent: {
      primary: '#4a90e2',
      hover: '#5ba0f2',
      active: '#3a80d2',
    },
    status: {
      success: '#52c41a',
      error: '#ff4d4f',
      warning: '#faad14',
      info: '#1890ff',
    },
    method: {
      get: '#52c41a',
      post: '#1890ff',
      put: '#faad14',
      patch: '#9254de',
      delete: '#ff4d4f',
      options: '#13c2c2',
      head: '#722ed1',
    },
  },
};

export const typography = {
  fontFamily: {
    sans: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    mono: '"JetBrains Mono", "Fira Code", Consolas, monospace',
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
