# 🌌 Aura AI IDE — Next-Generation AI-Powered Development Environment

<div align="center">
  <img src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" width="100%" alt="Aura IDE Banner" />
  <p><i>"Write software at the speed of thought with the power of multi-engine AI."</i></p>
</div>

---

## 🌟 Tentang Aura AI IDE

**Aura AI IDE** adalah lingkungan pengembangan terpadu (IDE) modern yang dirancang untuk pengembang masa depan. Menggabungkan estetika premium bergaya *glassmorphism* dengan integrasi AI yang mendalam, Aura memungkinkan Anda membangun aplikasi web dan desktop dalam satu alur kerja yang sangat mulus.

IDE ini bukan sekadar editor kode — ini adalah **ekosistem pengembangan lengkap** dengan terminal native, sinkronisasi GitHub real-time, dan sistem rilis otomatis (CI/CD) mandiri.

---

## 🚀 Fitur Utama

### 🧠 Multi-Engine AI Intelligence
- **Multi-Provider AI:** Dukungan penuh untuk Google Gemini 2.0 (Flash & Pro), OpenRouter (Model gratis), Bytez, dan SumoPod AI.
- **AI Streaming:** Respons AI ditampilkan secara real-time (kata demi kata) untuk pengalaman interaksi yang jauh lebih cepat.
- **Super Claude Skills:** Sistem skill cepat bawaan untuk tugas-tugas umum seperti analisis, refactor, dan debugging.
- **Attach File ke AI:** Lampirkan gambar atau file ke percakapan AI untuk konteks yang lebih kaya.

### 💻 Editor Profesional
- **Monaco Editor:** Engine yang sama dengan VS Code — mendukung syntax highlighting, autocomplete, bracket pair colorization, code folding, dan minimap.
- **Multi-Tab Editing:** Bekerja dengan banyak file secara bersamaan dengan tab yang bisa ditutup.
- **Breadcrumbs Navigation:** Bar navigasi path file di bagian atas editor untuk pelacakan posisi file.
- **File Search (Ctrl+P):** Cari file secara cepat di seluruh proyek.
- **Command Palette (Ctrl+Shift+P):** Pusat perintah cepat untuk mengontrol seluruh fitur IDE.

### 🖥️ Mode Desktop (Windows Installer)
- **Native Terminal:** Eksekusi perintah asli (`npm`, `git`, `node`, `powershell`) langsung dari IDE.
- **Backend Frame:** Tauri v2 (Rust-based) — Ringan, aman, dan performa native tinggi.

### 🔗 Integrasi Mendalam
- **Integrasi Pihak Ketiga:** GitHub API, Model Context Protocol (MCP).
untuk koneksi ke server MCP pihak ketiga.
- **Internal Browser:** Preview proyek HTML/CSS/JS langsung di dalam IDE dengan split view.

### 💎 Premium User Experience
- **Modern Interface:** Desain *glassmorphism* dengan animasi halus (*Framer Motion*).
- **Flexible Layouts:** Mode Klasik, Modern (Sidebar Kanan), atau **Zen Mode** (fokus tanpa gangguan).
- **Resizable Panels:** Sidebar, terminal, dan browser bisa di-resize sesuai kebutuhan.
- **Export Project:** Ekspor seluruh proyek sebagai file `.zip` dengan satu klik.

---

## 🛠️ Tech Stack

| Layer       | Teknologi                                   |
|:------------|:--------------------------------------------|
| **Frontend** | React 19, TypeScript, Vite 6               |
| **Editor**   | Monaco Editor (Engine VS Code)             |
| **Desktop**  | Tauri 2 (Rust-based, ringan & cepat)       |
| **Styling**  | Tailwind CSS 4, Framer Motion              |
| **Icons**    | Lucide React                                |
| **AI**       | Google Gemini, OpenRouter, Bytez, SumoPod  |
| **Cloud**    | Supabase (PostgreSQL + Auth)               |
| **CI/CD**    | GitHub Actions (Build otomatis .exe)       |

---

## 📖 Panduan Penggunaan

### 1. Instalasi Lokal (Mode Web / Development)

```bash
# Clone repositori
git clone https://github.com/budagbogor/auraide.git
cd auraide

# Instal dependensi
npm install

# Jalankan aplikasi (mode web)
npm run dev
```

Aplikasi akan berjalan di `http://localhost:3000`.

### 2. Konfigurasi AI

Buka menu **Settings** (ikon gear di sidebar kiri bawah), lalu:
1. Pilih **AI Provider**: Gemini, OpenRouter, Bytez, atau SumoPod.
2. Masukkan **API Key** untuk provider yang dipilih.
3. Pilih **Model** yang diinginkan.
4. Klik **Test Connection** untuk memverifikasi koneksi.

**Provider yang didukung:**
- **Google Gemini** — Gemini 2.0 Flash, Gemini 2.0 Pro, Gemini 1.5 Flash
- **OpenRouter** — Model gratis (auto-refresh daftar model)
- **Bytez** — Berbagai model enterprise
- **SumoPod** — Model terbaru 2026

### 3. Manajemen File

| Aksi                    | Cara                                                     |
|:------------------------|:---------------------------------------------------------|
| Buat file baru          | Klik ikon `+` di Explorer sidebar                        |
| Buka folder (web)       | Klik ikon folder di Explorer                             |
| Buka folder (native)    | Klik ikon folder kuning *(khusus versi Desktop)*         |
| Simpan ke cloud         | Klik ikon ☁️↑ (Cloud Upload) di Explorer                 |
| Muat dari cloud         | Klik ikon ☁️↓ (Cloud Download) di Explorer               |
| Ekspor sebagai ZIP      | Klik ikon Download di Explorer                           |
| Simpan file (Ctrl+S)    | Otomatis tersimpan ke disk *(versi Desktop)*             |

### 4. GitHub Integration

1. Buka tab **GitHub** di sidebar (ikon GitHub).
2. Masukkan **Personal Access Token** GitHub Anda.
3. Klik **Connect with Token** untuk melihat daftar repository.
4. Klik repository untuk **clone** langsung ke editor.
5. Gunakan tombol **Push** (ikon GitHub di Explorer) untuk mendorong perubahan.

### 5. Terminal (Khusus Versi Desktop)

Terminal di versi Desktop mendukung eksekusi perintah asli:

```bash
npm install        # Install dependencies
npm run dev        # Jalankan dev server
git status         # Cek status git
git push           # Push ke remote
```

Terminal secara otomatis mengenali **working directory** dari folder yang Anda buka via Native Dialog.

### 6. Keyboard Shortcuts

| Shortcut          | Fungsi                      |
|:------------------|:----------------------------|
| `Ctrl+S`          | Simpan file aktif            |
| `Ctrl+P`          | Cari file (Quick Search)     |
| `Ctrl+Shift+P`    | Command Palette              |
| `Ctrl+Shift+E`    | Buka Explorer sidebar        |
| `Ctrl+Shift+F`    | Buka Search sidebar          |
| `Ctrl+Shift+A`    | Buka AI Chat sidebar         |
| `` Ctrl+` ``      | Toggle Terminal              |

---

## 🏗️ Build & Release (CI/CD)

Aura IDE menggunakan **GitHub Actions** untuk membangun installer Windows secara otomatis.

### Cara Membuat Rilis Baru:

```bash
# 1. Pastikan kode stabil di branch main
git add . && git commit -m "release: v3.4.0"
git push

# 2. Buat tag versi
git tag v3.4.0

# 3. Push tag ke GitHub
git push origin v3.4.0
```

GitHub Actions akan otomatis:
- ✅ Setup Node.js 24 & Rust
- ✅ Build frontend (Vite)
- ✅ Compile backend (Tauri/Rust)
- ✅ Bundle installer Windows (NSIS + MSI)
- ✅ Upload ke halaman **Releases**

Unduh hasil build di: [github.com/budagbogor/auraide/releases](https://github.com/budagbogor/auraide/releases)

---

## 📂 Struktur Proyek

```
auraide/
├── src/                      # Source code frontend (React + TypeScript)
│   ├── App.tsx               # Komponen utama IDE
│   ├── main.tsx              # Entry point React
│   ├── index.css             # Stylesheet utama (Tailwind)
│   ├── constants/            # Konstanta dan konfigurasi
│   │   └── superClaude.ts    # Definisi Super Claude Skills
│   └── services/             # Layanan backend/API
│       ├── geminiService.ts  # Google Gemini AI (+ Streaming)
│       ├── openRouterService.ts  # OpenRouter integration
│       ├── bytezService.ts   # Bytez AI integration
│       ├── supabaseService.ts    # Supabase cloud storage
│       ├── githubService.ts  # GitHub API integration
│       └── mcpService.ts     # MCP Protocol client
├── src-tauri/                # Backend Rust (Tauri)
│   ├── src/lib.rs            # Plugin initialization
│   ├── Cargo.toml            # Rust dependencies
│   ├── tauri.conf.json       # Tauri configuration
│   ├── capabilities/         # Permission declarations
│   │   └── default.json      # FS, Shell, Dialog permissions
│   └── icons/                # App icons (semua ukuran)
├── .github/workflows/        # CI/CD Pipelines
│   └── release.yml           # Windows EXE auto-build
├── package.json              # Node.js dependencies & scripts
└── vite.config.ts            # Vite bundler configuration
```

---

## 📅 Roadmap

- [x] Multi-Provider AI (Gemini, OpenRouter, Bytez, SumoPod)
- [x] AI Streaming Response (Real-time)
- [x] GitHub Clone, Commit & Push
- [x] Supabase Cloud Storage (Default Database)
- [x] MCP Protocol Support
- [x] Native Terminal Bridge (Desktop)
- [x] Native File Sync & Direct Disk-Save
- [x] Breadcrumbs Navigation
- [x] Windows Installer (.exe) via CI/CD
- [x] Custom Aura IDE App Icon
- [ ] Plugin / Extension Ecosystem
- [ ] Multi-user Real-time Collaboration
- [ ] Integrated Debugger
- [ ] Git Diff Viewer

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah **Apache-2.0 License — Aura AI Group**.

---

<div align="center">
  <p>Dibuat dengan ❤️ oleh <b>AURA AI Group</b> untuk komunitas pengembang dunia.</p>
  <p><sub>Powered by Tauri · React · Monaco Editor · Google Gemini</sub></p>
</div>
