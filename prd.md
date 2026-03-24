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

### 2.3 Internal Preview Browser
- **Live Integrated Browser:** Terintegrasi di dalam split-view / panel IDE untuk melihat hasil render web (misalnya `localhost:3000`) secara *real-time* begitu server dijalankan lewat Terminal Cerdas. Sinkronisasi harus berjalan mulus dengan perubahan *hot-reload* kode.

### 2.4 Autonomous AI Agent (Multi-File Generation)
- **Zero-to-Hero Scaffolding:** AI dapat secara otomatis menyiapkan seluruh pohon direktori dan *file* yang dibutuhkan untuk web atau aplikasi *mobile* sekaligus (tidak membuat satu file per satu file secara manual).
- **High-Accuracy Planning:** AI selalu melakukan fase *planning* (merencanakan file, arsitektur, dan urutan eksekusi) sebelum ia membuat atau memodifikasi kode.
- **Clean Code & Robustness:** Menghasilkan kualitas *production-ready*, kode berarsitektur rapi, serta tingkat keberhasilan target (success rate) 100%.

## 3. Teknologi yang Digunakan
- **Frontend / UI:** React 19, TypeScript, Vite, Tailwind CSS 4, Framer Motion.
- **Editor Engine:** Monaco Editor.
- **Backend Frame:** Tauri v2 (Rust-based) — Ringan, aman, dan performa native tinggi.
- **Integrasi Pihak Ketiga:** GitHub API, Model Context Protocol (MCP).

## 4. Kriteria Keberhasilan (Success Metrics)
1. Terminal di prompt chat dapat digunakan 100% untuk mengeksekusi *command* build dan dev.
2. Web browser internal berjalan baik ketika perintah *dev server* dijalankan menggunakan prompt.
3. Model AI mampu mendeteksi *error*, menjalankan iterasi perbaikan secara mandiri.
4. Pergeseran antarmodel AI (OpenRouter & SumoPod) tidak menyebabkan *delay* putus asa atau macet.
