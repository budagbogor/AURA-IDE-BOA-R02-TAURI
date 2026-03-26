# Development Plan (DevPlan)

Dokumen ini mendeskripsikan peta jalan (*roadmap*) pengembangan untuk mencapai visi AURA AI IDE yang otonom dan tangguh.

## Fase 1: Perbaikan Mesin & Smart Routing AI [DONE]
- [x] Menganalisis cara kerja pemanggilan API OpenRouter yang ada saat ini.
- [x] Mengembangkan modul `ModelRouter` untuk secara otomatis mengecek tingkat trafik (`availability`) dari model-model gratis di OpenRouter setiap saat/setiap sesi.
- [x] Mengembangkan logic pengurutan (sorting API) SumoPod berdasarkan parameter harga dan pengurutan prioritas.
- [x] Mengintegrasikan perpindahan halus (fallback system/auto-switch) agar ketika satu model sibuk atau gagal, AI IDE langsung memakai model alternatif tanpa merusak *context* sebelumnya.

## Fase 2: Pembangkitan Terminal Terintegrasi AI (AI-Driven Terminal) [DONE]
- [x] Menambahkan *permission* eksplisit dan mekanisme koneksi antara jendela AI Chat React dengan modul eksekusi shell Tauri.
- [x] Membangun antarmuka parser spesial di Prompt Chat.
- [x] Menciptakan *event listener* yang menyiarkan output terminal secara *streaming*.

## Fase 3: Integrasi Browser Internal [DONE]
- [x] Merancang window internal preview di UI.
- [x] Membuat auto-detect localhost port.
- [x] Integrasi sinkronisasi penyegaran tab (HMR).

## Fase 4: Eksekusi Kode Otonom & Agen Perencana (Planning Agent) [DONE]
- [x] Meningkatkan prompt dasar (System Prompt).
- [x] Mendukung aksi pembaruan beberapa file sekaligus (*multi-file patch/diff*).
- [x] Loop otonom: `Plan` -> `Write Files` -> `Run terminal` -> `Auto Fix`.
- [x] Menyediakan infrastruktur "file-tree scaffold" via Tauri FS.

## Fase 5: Final Polish & System Audit (v5.6.0) [DONE]
- [x] Audit Sistem: Penghapusan Supabase Cloud & Electron (Lean Engine).
- [x] Optimasi Layout: DEFAULT LOOK & ZEN ONLY modes.
- [x] Sinkronisasi Dokumentasi & Keyboard Shortcuts.
- [x] Final Build & Release Ready.

## Fase 5.1: Command Execution Hardening (Windows Reliability) [DONE]
- [x] Memperbaiki parsing command di Windows: hindari *double-quoting* saat `cmd /S /C` menerima command yang sudah mengandung path/quote (contoh `npm.cmd`).
- [x] Memastikan eksekusi `npm`/`npx` dapat resolver path biner secara lebih aman melalui `where`.

## Fase 6: Reliability & Verification Loop (Target: success >= 99%) [IN PROGRESS]
- [x] Implementasi *Preflight* saat menjalankan command build/dev:
  - [x] Validasi `cwd` dan `package.json` tersedia untuk command `npm/npx/node` yang membutuhkan project.
  - [x] Validasi `node` dan (jika relevan) `npm` tersedia melalui `node -v` / `npm -v`.
  - [ ] Validasi `package-lock.json`/lockfile untuk memutuskan antara `npm install` vs `npm ci` (jika memungkinkan).
- [x] Recovery yang aman:
  - [x] Guardrail untuk operasi destruktif (mis. `rm -rf`, `del`, `npm audit fix --force`) dengan require `--yes`.
  - [ ] Fallback ke langkah manual dengan instruksi ringkas ketika auto-fix gagal.
- [x] Standardisasi command runner:
  - [ ] Satu jalur eksekusi untuk Windows & Unix (mengurangi perbedaan quoting).
  - [x] Tambah timeout perintah (menghentikan proses jika tidak ada output awal dalam ~25 detik).

## Fase 7: Debugging Assistant & Error Navigation [PENDING]
- [ ] Parsing error log yang lebih terstruktur (Vite/TS/Tauri/Rust jika relevan).
- [ ] Jump-to-file/line di Monaco untuk error yang dikenali (mengurangi waktu investigasi).
- [ ] Ringkasan error yang dikirim ke AI (bukan seluruh log mentah) agar iterasi lebih cepat.

## Fase 8: Tool/Skill Ecosystem (Pluginization) [PENDING]
- [ ] Definisikan *Tool/Skill Manifest*:
  - [ ] metadata (nama, input schema, permission scope, contoh command)
  - [ ] handler eksekusi + format output terstruktur
- [ ] UI manajemen skills: enable/disable, permission prompts, dan konfigurasi default.
- [ ] Library skill untuk workflow umum:
  - [ ] `npm install`, `npm run dev`, `vite preview`
  - [ ] `npm run build`, `npm run lint`
  - [ ] command untuk scaffold app sesuai template project.

## Fase 9: Onboarding & Distribution [PENDING]
- [ ] First-run wizard (alur cepat):
  - [ ] pilih project folder
  - [ ] cek ketersediaan Node/npm di sistem
  - [ ] jalankan `npm install` + `npm run dev` dengan panduan
- [ ] Dokumentasi requirements yang jelas untuk user:
  - [ ] apa yang “wajib” (mis. Node untuk Terminal)
  - [ ] apa yang “tidak perlu” (untuk runtime aplikasi desktop)
- [ ] Stabilitas rilis:
  - [ ] rilis berbasis tag `v*` + changelog otomatis yang merangkum perbaikan reliability/agent loop.
