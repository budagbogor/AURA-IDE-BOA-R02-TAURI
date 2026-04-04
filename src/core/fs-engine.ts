import { useAppStore } from '../store/useAppStore';

// Note: tauriFs should be passed as argument or imported if available globally
// For now, we define the logic that can be called from components

export const fsEngine = {
  /**
   * Menormalisasi path file agar konsisten di berbagai sistem operasi
   */
  normalizePath: (path: string): string => {
    return path.replace(/^\.\/|^\//, '').replace(/\\/g, '/');
  },

  /**
   * Mendapatkan bahasa pemrograman berdasarkan ekstensi file
   */
  getLanguageByExtension: (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'ts':
      case 'tsx': return 'typescript';
      case 'js':
      case 'jsx': return 'javascript';
      case 'css': return 'css';
      case 'html': return 'html';
      case 'json': return 'json';
      case 'py': return 'python';
      case 'rs': return 'rust';
      default: return 'text';
    }
  },

  /**
   * Menghitung tree struktur folder dari daftar file (untuk konteks AI)
   */
  generateProjectTree: (files: any[]): string => {
    return files.map(f => f.id || f.name).join('\n');
  }
};
