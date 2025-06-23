import { Theme } from '@/types';

export const theme: Theme = {
  colors: {
    primary: '#58D1FF',      // Mavi ana renk
    secondary: '#FF1344',    // Kırmızı vurgu rengi
    background: '#0B1D31',   // Koyu mavi arka plan
    surface: '#1A2B42',     // Yüzey rengi
    text: '#FFFFFF',        // Ana metin rengi
    textSecondary: '#B8C5D1', // İkincil metin rengi
    success: '#00FF6B',     // Yeşil başarı rengi
    error: '#FF1344',       // Kırmızı hata rengi
    warning: '#FFB800',     // Sarı uyarı rengi
  },
  
  spacing: {
    xs: 4,   // 4px
    sm: 8,   // 8px
    md: 16,  // 16px
    lg: 24,  // 24px
    xl: 32,  // 32px
  },
  
  fonts: {
    family: "'Source Sans Pro', sans-serif",
    sizes: {
      small: '1.4rem',   // 14px
      medium: '1.8rem',  // 18px
      large: '2.4rem',   // 24px
      xlarge: '3.2rem',  // 32px
    },
  },
};

// Yardımcı fonksiyonlar
export const getSpacing = (size: keyof Theme['spacing']) => `${theme.spacing[size]}px`;

export const getColor = (color: keyof Theme['colors']) => theme.colors[color];

export const getFontSize = (size: keyof Theme['fonts']['sizes']) => theme.fonts.sizes[size];

// Breakpoints for responsive design
export const breakpoints = {
  mobile: '480px',
  tablet: '768px',
  desktop: '1024px',
  wide: '1200px',
};

// Shadow system
export const shadows = {
  small: '0 2px 4px rgba(0, 0, 0, 0.1)',
  medium: '0 4px 8px rgba(0, 0, 0, 0.15)',
  large: '0 8px 16px rgba(0, 0, 0, 0.2)',
  game: '0 0 250px 0 rgba(0, 0, 0, 0.4)', // Oyun alanı için özel gölge
};

// Animation timing
export const animations = {
  fast: '0.15s',
  normal: '0.3s',
  slow: '0.5s',
  easing: {
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  },
};

export default theme; 