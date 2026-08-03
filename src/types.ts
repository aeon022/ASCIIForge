export type ColorPreset = 'cyan' | 'magenta' | 'green' | 'yellow' | 'red' | 'neon' | 'fire' | 'plain';
export type CommentLanguage = 'typescript' | 'js' | 'python' | 'html' | 'css' | 'c' | 'rust';

export interface RenderOptions {
  font?: string;
  color?: ColorPreset;
  output?: string;
  comment?: CommentLanguage;
  licenseKey?: string;
  watermark?: boolean;
}
