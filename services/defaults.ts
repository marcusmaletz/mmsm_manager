import { Persona, PromptConfig, UserProfile } from "../types";

export const DEFAULT_USER_PROFILE: UserProfile = {
  name: "",
  business: "",
  offer: "",
  usp: "",
  writingStyle: ""
};

export const DEFAULT_PERSONAS: Persona[] = [
  {
    id: '1',
    name: 'Unternehmer & CEOs',
    description: 'Inhaber von KMUs und Startups, 30-50 Jahre alt, fokusiert auf Wachstum, Effizienz und Skalierung. Wenig Zeit, schätzen direkte Ansprache.'
  },
  {
    id: '2',
    name: 'Marketing Manager',
    description: 'Marketing-Profis in Agenturen oder Unternehmen. Kennen Fachbegriffe, suchen nach konkreten Hacks und Trends. 25-40 Jahre.'
  },
  {
    id: '3',
    name: 'Gen Z Konsumenten',
    description: 'Digital Natives, 18-25 Jahre. Schätzen Authentizität, Humor und schnelle Schnitte. Allergisch gegen "Corporate Speak".'
  }
];

export const DEFAULT_PROMPTS: PromptConfig = {
  global: "Du bist ein Weltklasse Social Media Stratege. Erstelle Inhalte, die hohe Interaktionsraten erzielen.",
  instagram_feed: "Erstelle eine fesselnde Caption mit Emojis. Die Bild-Idee soll ästhetisch und 'instagrammable' sein.",
  linkedin: "Schreibe einen seriösen, aber nahbaren Business-Text. Nutze Storytelling-Elemente. Strukturiere den Slide-Carousel-Inhalt logisch.",
  facebook: "Der Text soll Konversationen anregen (Fragen stellen). Die Tonalität ist locker und gemeinschaftsorientiert.",
  blog_post: "Schreibe SEO-optimiert. Nutze H1, H2, H3 Tags im HTML. Der Inhalt soll Mehrwert bieten und gut strukturiert sein.",
  instagram_story: "Erstelle ein Skript für 3-5 Story-Sequenzen. Fokus auf Engagement (Umfragen, Sticker).",
  reels_shorts: "Erstelle ein visuelles Skript (Tabelle). Spalte 1: Was man sieht (schnelle Schnitte). Spalte 2: Audio/Voiceover.",
  youtube_video: "Erstelle 5 klickstarke Titel-Ideen und eine detaillierte Gliederung des Videos mit Zeitstempeln."
};

export const TONE_SUGGESTIONS = [
  "Professionell", "Witzig", "Dringend", "Emotional", "Lehrend", "Sarkastisch", "Minimalistisch", "Begeisternd"
];