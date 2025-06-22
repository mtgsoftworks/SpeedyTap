// Global Type Definitions

// Webpack Hot Module Replacement
declare module NodeJS {
  interface Module {
    hot?: {
      accept(path?: string | string[], callback?: () => void): void;
      decline(path?: string | string[]): void;
    };
  }
}

// Process environment
declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV?: 'development' | 'production' | 'test';
  }
}

// Window extensions
declare global {
  interface Window {
    Capacitor?: any;
    SpeedyTap?: any;
  }
}

// CSS Modules
declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

// Asset modules
declare module '*.svg' {
  const content: string;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.jpeg' {
  const content: string;
  export default content;
}

declare module '*.gif' {
  const content: string;
  export default content;
}

declare module '*.ico' {
  const content: string;
  export default content;
}

declare module '*.mp3' {
  const content: string;
  export default content;
}

declare module '*.wav' {
  const content: string;
  export default content;
}

// Global Type Definitions for Webpack Asset Modules
// These definitions enable TypeScript to recognize asset imports

// Audio Files
declare module '*.mp3' {
  const src: string;
  export default src;
}

declare module '*.wav' {
  const src: string;
  export default src;
}

declare module '*.ogg' {
  const src: string;
  export default src;
}

// Image Files
declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.jpg' {
  const src: string;
  export default src;
}

declare module '*.jpeg' {
  const src: string;
  export default src;
}

declare module '*.gif' {
  const src: string;
  export default src;
}

declare module '*.webp' {
  const src: string;
  export default src;
}

declare module '*.ico' {
  const src: string;
  export default src;
}

// Vector Files
declare module '*.svg' {
  const src: string;
  export default src;
}

// Font Files
declare module '*.woff' {
  const src: string;
  export default src;
}

declare module '*.woff2' {
  const src: string;
  export default src;
}

declare module '*.eot' {
  const src: string;
  export default src;
}

declare module '*.ttf' {
  const src: string;
  export default src;
}

declare module '*.otf' {
  const src: string;
  export default src;
}

// CSS Files
declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

declare module '*.scss' {
  const content: { [className: string]: string };
  export default content;
}

declare module '*.sass' {
  const content: { [className: string]: string };
  export default content;
}

declare module '*.less' {
  const content: { [className: string]: string };
  export default content;
}

// JSON Files
declare module '*.json' {
  const content: any;
  export default content;
}

// Webpack Hot Module Replacement
declare const module: NodeJS.Module & {
  hot?: {
    accept: (dependency?: string | string[], callback?: () => void) => void;
    decline: (dependency?: string | string[]) => void;
    dispose: (callback: () => void) => void;
    addDisposeHandler: (callback: () => void) => void;
    removeDisposeHandler: (callback: () => void) => void;
    check: (autoApply?: boolean) => Promise<string[] | null>;
    apply: (options?: any) => Promise<string[] | null>;
    status: () => string;
    data: any;
  };
};

// Capacitor Global Types
declare global {
  interface Window {
    Capacitor?: {
      platform: string;
      isNative: boolean;
      isPluginAvailable: (name: string) => boolean;
      getPlatform: () => string;
      convertFileSrc: (filePath: string) => string;
    };
  }
}

export {}; 