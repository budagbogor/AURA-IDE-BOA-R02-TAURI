import { FileItem } from '../../types';

export function buildProjectContextPrompt(files: FileItem[], activeFileId?: string, projectTree?: string): string {
  if ((!files || files.length === 0) && !projectTree) {
    return "Tidak ada konteks proyek yang tersedia.";
  }

  const openFilesList = files.map(f => `- ${f.id} (${f.language})`).join('\n');
  
  let contentDump = files.map(f => {
    return `
### FILE CONTENT: ${f.id}
\`\`\`${f.language}
${f.content}
\`\`\`
`.trim();
  }).join('\n\n');

  const activeInfo = activeFileId ? `**FILE AKTIF SAAT INI**: ${activeFileId}` : '';

  return `
=== KONTEKS PROYEK (ENVIRONMENT) ===
${projectTree ? `\nSTRUKTUR DIREKTORI PROYEK (TREE):\n${projectTree}\n` : ''}

DAFTAR FILE TERBUKA DI EDITOR (TAB):
${openFilesList}

${activeInfo}

=== ISI FILE (Sangat Penting untuk Akurasi): ===
${contentDump}
  `.trim();
}
