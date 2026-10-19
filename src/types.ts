export type ColorPreset = 'cyan' | 'magenta' | 'green' | 'yellow' | 'red' | 'neon' | 'fire' | 'plain';
export type CommentLanguage = string; // see SUPPORTED_LANGUAGES in commentBox.ts

export interface RenderOptions {
  font?: string;
  color?: ColorPreset;
  output?: string;
  comment?: CommentLanguage;
  licenseKey?: string;
  watermark?: boolean;
}
