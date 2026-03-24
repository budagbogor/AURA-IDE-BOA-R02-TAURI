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
