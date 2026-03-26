# Product Requirements Document (PRD)

## 1. Visi dan Deskripsi Produk
**AURA AI IDE** adalah lingkungan pengembangan (IDE) terpadu bertenaga AI dengan tujuan menjadi produk berkelas dunia setara dengan Cursor, Trae, Windsurf, Kiro, dan Replit. IDE ini ditujukan untuk memberikan pengalaman "autonomous coding" dengan kapabilitas tinggi: menulis kode bersih, auto-fix bug, manajemen file yang otomatis, serta eksekusi berbasis *planning* sebelum mulai melakukan pembuatan sistem secara independen.

## 2. Fitur Utama & Kebutuhan Sistem

### 2.1 Manajemen Model AI Terpusat (Smart Switch)
- **OpenRouter Auto-Switch:** Sistem akan secara otomatis mengidentifikasi dan berpindah ke model AI gratis dari OpenRouter yang memiliki trafik/load terendah namun dengan kemampuan coding yang kuat (High Quality, Low Latency).
- **SumoPod Integration:** Sistem juga menyediakan pilihan dari API SumoPod, yang akan mengurutkan model secara cerdas dari yang paling murah/gratis hingga ke level premium, dikhususkan pada model yang terbukti unggul untuk keperluan *coding*.

### 2.2 Terminal Cerdas (AI-Driven Terminal)
- **Integrasi Terminal ke Chat Prompt:** AI dapat secara mandiri atau dengan izin pengguna menginisialisasi perintah shell (contoh: `npm install`, `npm run dev`, `npm audit fix`, dll) secara langsung dari obrolan/prompt, bukan sekadar memberikan teks instruksi.
- **Autonomous Terminal Feedback:** Hasil eksekusi terminal (seperti *error build* atau informasi port) langsung dikirim kembali ke AI untuk memicu perbaikan bug otomatis (Auto Fix).
- **Eksekusi Deterministik (Reliability Hardening):**
  - Terminal harus konsisten untuk perintah di Windows (`cmd /S /C`) dan Unix (`sh -c`), termasuk penanganan *quoting* dan path biner (`npm.cmd`, `npx.cmd`).
  - `working directory (cwd)` harus selalu tepat sesuai folder project yang sedang dibuka.
- **Preflight & Self-Diagnosis:**
  - Saat menjalankan `npm/node` command, IDE melakukan pengecekan cepat `node -v` dan `npm -v` + validasi `package.json` ada di `cwd`.
  - Jika gagal, IDE menampilkan ringkasan kegagalan yang mudah dipahami dan mengarahkan langkah perbaikan.
- **Recovery Loop yang Aman:**
  - Auto-fix hanya mengeksekusi langkah non-destructive secara default; operasi yang berpotensi merusak harus minta izin eksplisit.
  - Saat gagal berulang, IDE menurunkan tingkat otonomi dan meminta tindakan manual.

### 2.3 Internal Preview Browser
- **Live Integrated Browser:** Terintegrasi di dalam split-view / panel IDE untuk melihat hasil render web (misalnya `localhost:3000`) secara *real-time* begitu server dijalankan lewat Terminal Cerdas. Sinkronisasi harus berjalan mulus dengan perubahan *hot-reload* kode.
- **Auto-Open Preview:** IDE secara otomatis membuka preview begitu port terdeteksi dari stdout/stderr terminal, serta menampilkan tombol untuk membuka di browser eksternal.

### 2.4 Autonomous AI Agent (Multi-File Generation)
- **Zero-to-Hero Scaffolding:** AI dapat secara otomatis menyiapkan seluruh pohon direktori dan *file* yang dibutuhkan untuk web atau aplikasi *mobile* sekaligus (tidak membuat satu file per satu file secara manual).
- **High-Accuracy Planning:** AI selalu melakukan fase *planning* (merencanakan file, arsitektur, dan urutan eksekusi) sebelum ia membuat atau memodifikasi kode.
- **Clean Code & Robustness:** Menghasilkan kualitas *production-ready*, kode berarsitektur rapi, serta tingkat keberhasilan target (success rate) 100%.
- **Debugging Feedback Loop:** AI menggunakan log error terstruktur (stdout/stderr + exit code) untuk mengubah kode, lalu memverifikasi dengan menjalankan ulang perintah yang sama.
- **Tool/Skill Safety Layer:** Aksi AI yang melibatkan filesystem, network, atau proses berjalan harus melewati model izin/permission yang konsisten.

## 3. Teknologi yang Digunakan
- **Frontend / UI:** React 19, TypeScript, Vite, Tailwind CSS 4, Framer Motion.
- **Editor Engine:** Monaco Editor.
- **Backend Frame:** Tauri v2 (Rust-based) — Ringan, aman, dan performa native tinggi.
- **Integrasi Pihak Ketiga:** GitHub API, Model Context Protocol (MCP).

## 4. Kriteria Keberhasilan (Success Metrics)
1. Terminal di prompt chat mampu mengeksekusi *command* build/dev dengan success rate >= 99% pada proyek berbasis `npm` (terutama `npm install` dan `npm run dev`) di mode Desktop/Tauri.
2. Web preview/auto-open berjalan baik ketika perintah `dev` dijalankan: port terdeteksi dan preview terbuka dalam waktu <= 5 detik setelah log port muncul.
3. Model AI mampu mendeteksi error dan melakukan iterasi perbaikan: rata-rata <= 3 iterasi sebelum build/dev sukses, dengan success rate >= 70%.
4. Pergeseran antarmodel AI (OpenRouter & SumoPod) tidak menyebabkan *delay* putus asa atau macet: latensi tambahan untuk planning+run <= 2x baseline.
5. Keamanan/izin konsisten: operasi yang berpotensi merusak (mis. penghapusan file, perubahan dependency destruktif) selalu memerlukan izin eksplisit atau berada di bawah guardrail default yang aman.
