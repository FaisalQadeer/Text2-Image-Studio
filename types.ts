
export type AspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:4';

export type Page = 'home' | 'about' | 'contact' | 'privacy' | 'terms' | 'disclaimer';

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
}

export interface AppState {
  images: GeneratedImage[];
  isGenerating: boolean;
  error: string | null;
  theme: 'dark' | 'light';
  activePage: Page;
}
