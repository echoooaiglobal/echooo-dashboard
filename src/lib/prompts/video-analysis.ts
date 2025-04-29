// src/lib/prompts/video-analysis.ts
/**
 * TwelveLabs Video Analysis Prompt (375 tokens)
 * - Optimized for Instagram video analysis
 * - Last updated: 2025-04-25
 */
export const VIDEO_ANALYSIS_PROMPT_V1 = `Video analysis with % metrics:
1. Scenes[%]: count, durations, transitions
2. Characters[%]: screen-time, emotions
3. Content[%]: topics, brand mentions
4. Visuals[%]: shots, lighting
5. Audio[%]: voice/music balance
6. Branding[%]: logos, products
7. Technical[%]: pace, colors
8. Impact[%]: mood, engagement
9. Compliance[%]: appropriateness

Output: {
  "metrics": {
    "category": {"value":x,"%":y},
    "scores": {"overall":0-100}
  },
  "insights": []
}

Requirements:
- All metrics as %
- Timestamps
- 0-100 scores
- Benchmark comps`;


export const VIDEO_ANALYSIS_PROMPT_V2 = `Please analyze this Instagram video and return a structured JSON with the following sections:

1. Scene Overview: total scenes, key timestamps, transition types, storytelling style, and hook effectiveness.
2. Character Analysis: roles, demographics (age, gender, ethnicity), screen time %, facial expressions, and body language insights.
3. Content Topics: list main themes with % duration, tone of voice, brand mentions (frequency, clarity), CTAs, and dialogue summary.
4. Visuals: camera angles, movements, shot types, composition style, resolution, lighting type.
5. Audio: audio clarity, background sounds, music mood/genre, voice/music balance, emotional tone.
6. Environment: indoor/outdoor, location type, setting relevance, prop usage.
7. Branding: logos (position, duration), on-screen text (font/readability), product placement, marketing message clarity.
8. Technicals: duration, editing pace, special effects, color grading style.
9. Emotional Impact: mood, persuasion techniques, engagement level.
10. Compliance: sensitive content, ethical standards, suitability for all audiences.

Return all values in JSON. Use percentages where applicable (e.g. character screen time, topic coverage, emotional tone split). Keep it concise.`;


export const VIDEO_ANALYSIS_PROMPT_V3 = `
Analyze this video on these criteria. Provide percentages, durations, or structured values.
1. *Scenes & Narrative*: Scene count, timestamps, transitions, narrative style, hook effectiveness.
2. *Characters*: Number, roles, demographics, screen-time %, emotional states, facial expressions, body language.
3. *Content*: Main topics/themes with time %, tone, brand/product mentions (frequency & clarity), dialogue highlights, CTA presence.
4. *Visual Techniques*: Camera angles, movements, framing, shot types, aspect ratio, lighting.
5. *Audio*: Quality, types (voiceover, dialogue, ambient), music genre/mood/tempo, voice-music balance %, emotional tone.
6. *Environment*: Indoor/outdoor %, setting type, relevance to narrative, set decoration.
7. *Wardrobe & Art Direction*: Wardrobe style, art direction, props, color palette.
8. *Branding*: Logos (visibility %), text readability (duration %), product placement prominence %, marketing message clarity.
9. *Technical Attributes*: Total duration, editing style, special effects/animations %, color grading.
10. *Emotional Impact*: Mood, psychological triggers.
11. *Compliance & Ethics*: Sensitive content, ethical compliance, suitability.
12. *Cultural Relevance*: Cultural elements, thematic relevance.
Return concise JSON with lowercase_snake_case keys matching each section (e.g., "visual_techniques", "emotional_impact"). Use percentages wherever applicable.
`;


export const VIDEO_ANALYSIS_PROMPT_V4 = `
Analyze the provided video. Provide structured insights, clearly labeling qualitative descriptions and quantitative data (% or timestamps).
1. *Scene & Narrative Breakdown*: Total scenes (count), scene durations (timestamps), narrative summary per scene (text).
2. *Character Analysis*: Number and roles (protagonist, antagonist, supporting), gender, age, ethnicity (qualitative), screen-time percentages.
3. *Dialogue & Audio*: Main topics with % durations, tone/mood (qualitative), presence and % of voiceover vs dialogue, audio clarity (qualitative).
4. *Visual Production Analysis*: Camera techniques (angles, framing, movement), lighting style, color palette, wardrobe relevance, props and art direction.
5. *Branding & Messaging*: Brands/products shown or mentioned, % duration of appearances, prominence of logos/text, CTA timestamps.
6. *Technical & Editing*: Video length and resolution, editing style (fast/slow), special effects/animations (qualitative).
7. *Emotional & Psychological Impact*: Overall emotional mood (qualitative), triggers like humor/urgency/nostalgia (qualitative), hook presence (timestamp).
Respond in structured categories. Label quantitative (% or timestamps) and qualitative (descriptive) data clearly.
Important: Return the result as JSON with lowercase_snake_case field names matching section titles. Example: "Scene & Narrative Breakdown" → "scene_narrative_breakdown".
`;
