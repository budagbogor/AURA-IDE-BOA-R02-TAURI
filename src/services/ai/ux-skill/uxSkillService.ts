import { readTextFile } from '@tauri-apps/plugin-fs';

export async function getUXContext(): Promise<string> {
  try {
    // In a real Tauri app, we'd need to know the base path. 
    // Since we are in the source code, we assume the files are available via relative paths if bundled, 
    // or we use the known path structure.
    
    // For this implementation, we'll try to read from the expected locations.
    const styles = await readTextFile('src/services/ai/ux-skill/styles.csv').catch(() => '');
    const reasoning = await readTextFile('src/services/ai/ux-skill/ui-reasoning.csv').catch(() => '');
    const guidelines = await readTextFile('src/services/ai/ux-skill/ux-guidelines.csv').catch(() => '');

    return `
[UI/UX PRO MAX INTELLIGENCE - ACTIVE]
The following design system data is available for reasoning:

--- DESIGN STYLES ---
${styles}

--- DESIGN REASONING ---
${reasoning}

--- UX GUIDELINES ---
${guidelines}

Instructions:
1. Use the Spacing Rhythm (8dp) for all layout decisions.
2. Prioritize Transition Timing (150-300ms) for all interactive elements.
3. Use the Recommended Pattern based on the UI Category found in reasoning data.
4. Ensure Accessibility (WCAG AA/AAA) is maintained.
`;
  } catch (error) {
    console.error('Failed to load UX Context:', error);
    return '[UI/UX PRO MAX] Data unavailable. Fallback to general design principles.';
  }
}
