import { pushProjectToGitHub } from '../services/githubService';

export const githubEngine = {
  /**
   * Mengirim (Push) proyek saat ini ke GitHub
   */
  push: async (
    token: string, 
    repoName: string, 
    files: any[], 
    onStatus: (msg: string) => void
  ) => {
    if (!token) throw new Error("GitHub Token belum dikonfigurasi.");
    if (!repoName) throw new Error("Nama repositori tidak boleh kosong.");

    onStatus(`Memulai pengiriman ${files.length} file ke repositori '${repoName}'...`);
    
    try {
      await pushProjectToGitHub(token, repoName, files, onStatus);
      return true;
    } catch (err: any) {
      console.error('GitHub Push Error:', err);
      throw err;
    }
  }
};
