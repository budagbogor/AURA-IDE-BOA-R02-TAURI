import stylesCsv from './styles.csv?raw';
import reasoningCsv from './ui-reasoning.csv?raw';
import guidelinesCsv from './ux-guidelines.csv?raw';

export async function getUXContext(): Promise<string> {
  try {
    return `
[UI/UX PRO MAX INTELLIGENCE - ACTIVE]
The following design system data is available for reasoning:

--- DESIGN STYLES ---
${stylesCsv}

--- DESIGN REASONING ---
${reasoningCsv}

--- UX GUIDELINES ---
${guidelinesCsv}

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
