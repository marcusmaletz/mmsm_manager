export type Platform = 
  | 'instagram_feed'
  | 'linkedin'
  | 'facebook'
  | 'blog_post'
  | 'instagram_story'
  | 'reels_shorts'
  | 'youtube_video';

export enum ContentStatus {
  Draft = 'Draft',
  Approved = 'Approved',
  Scheduled = 'Scheduled',
  Published = 'Published'
}

export interface GeneratedContent {
  platform: Platform;
  title: string;
  content: string;
  visualPrompt?: string;
  imageUrl?: string; // New field for image data (base64 or url)
  hashtags?: string[];
  status: ContentStatus;
  scheduledDate?: string | null;
}

export interface BriefingData {
  topic: string;
  url?: string;
  tone: string[];
  targetAudience: string;
}

export interface Persona {
  id: string;
  name: string;
  description: string;
}

export interface PromptConfig {
  global: string;
  instagram_feed: string;
  linkedin: string;
  facebook: string;
  blog_post: string;
  instagram_story: string;
  reels_shorts: string;
  youtube_video: string;
}

export interface GenerationResponse {
  instagram_feed: { caption: string; visual_idea: string; hashtags: string[] };
  linkedin: { text: string; slide_structure: string[] };
  facebook: { text: string; visual_idea: string };
  blog_post: { title: string; meta_description: string; body_html: string };
  instagram_story: { sequences: string[] };
  reels_shorts: { script_table: Array<{ visual: string; audio: string }> };
  youtube_video: { title_ideas: string[]; outline: string[] };
}