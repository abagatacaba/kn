# KN — Audit master produk, varian, R&D, dan media

## Permintaan asli pengguna
"saya ingin anda lanjutkan development dari repo ini https://github.com/snakissb/KN
salah satu di sesi sebelumnya ada perbaikan master data product yang seharusnya memiliki varian dengan ui ux seperti etalase product, saya belum cek bagaimana ui uxnya intinya saya ingin seperti management master data seperti di ecomerce yang besar dimana bisa input varian dan beberapa banyak jenis varianya, kritik saya sebelumnya adalah ui uxnya tidak representasi itu dan logic munculnya dari rnd ini sama sekali tidak support design awal product dengan varian ini cek kembali, yang pasti untuk foto itu belum benar harusnya setiap varian bisa menyiman foto dan lebih dari 1 foto, saya perlu ada foto mockup model dari product tersebut contohnya maka sales saya harus bisa menunjukan ke customer. coba telusuri"

## Pilihan pengguna — batas otorisasi
- **AUDIT DAHULU**, sampaikan temuan sebelum mengubah kode. Jangan implementasi sebelum ada persetujuan lanjutan.
- Atribut varian fleksibel: warna × ukuran × material, beberapa foto per kombinasi.
- Foto diunggah manual serta dibuat dengan AI.
- Provider/model AI dan penggunaan kredensial belum dipilih untuk pekerjaan baru; tidak diminta selama audit.

## Persona
- Admin/MD: mengelola induk produk, atribut, kombinasi, dan media.
- R&D/desainer: merancang, menilai sampel, menyetujui spesifikasi serta menyiapkan visual.
- Sales: memilih varian yang tepat dan menunjukkan foto serta mockup kepada pelanggan.
- Pelanggan: melihat visual varian yang benar tanpa informasi internal.

## Kebutuhan inti (statis)
1. Master produk dengan pengalaman pengelolaan katalog/etalase, bukan sekadar daftar SKU.
2. Satu induk dengan kombinasi atribut fleksibel; satu kombinasi tetap satu SKU/product_id.
3. Alur R&D konsisten dengan induk, varian, persetujuan dan rilis produk.
4. Banyak foto per kombinasi, bukan satu URL; mendukung foto asli dan mockup model.
5. Sales dapat melihat galeri varian terpilih di desktop dan mobile.
6. Akses eksklusivitas/lini dan informasi biaya tetap terlindungi.

## Arsitektur yang ditemukan / keputusan audit
- Repo sumber: `https://github.com/snakissb/KN`, branch `main`, snapshot `0bfdf1aec6b82578527a855f85fc52d181eb3af5`.
- Salinan untuk audit: `/tmp/kn-audit`; **belum diimpor ke aplikasi `/app`**.
- Aplikasi `/app/frontend` dan `/app/backend` masih template awal, bukan KN. Jangan menganggap preview saat ini sebagai KN.
- KN memakai React, FastAPI, MongoDB. `product_templates` adalah induk katalog SHARED; `products` adalah SKU yang dirujuk stok/roll/RFID/SO/PO.
- R&D memakai `md_specs`, `md_samples`, dan `design_gallery`. Galeri desain sudah mempunyai banyak berkas, referensi opsional product_id, dan ilustrasi Gemini.
- Storage yang ditemukan adalah wrapper disk lokal, keputusan lama pemilik menurut komentar kode; jangan menggantinya diam-diam.
- Usulan mempertahankan ID SKU dan referensi transaksi, bukan membangun ulang stok. Ini rekomendasi audit, belum implementasi.
- Tidak ada perubahan kode aplikasi, konfigurasi, database, atau panggilan provider AI dalam sesi ini.

## Yang diselesaikan — 2026-09-06
- Membaca alur R&D → products, induk/varian, pengelolaan master, katalog desktop/mobile, galeri desain dan integrasi AI yang sudah ada.
- Verifikasi independen oleh testing agent: audit statis + fungsi terisolasi; **bukan tes aplikasi berjalan/end-to-end**.
- Tiga reproduksi logika: axis `values[]` dibuang oleh pembaca `options[]`; metadata `hex` hilang; resolver warna+grade ambigu untuk kombinasi lebar/material berbeda.
- Laporan: `/app/memory/AUDIT_PRODUCT_VARIANTS.md`, `/app/test_reports/iteration_1.json`, hasil probe `/app/test_reports/isolated_*_result.json`.
- Temuan belum diperbaiki, sesuai permintaan audit dahulu. Tidak ada fitur baru yang diklaim selesai.

## Prioritas backlog — menunggu persetujuan
### P0
- Samakan pembatasan visibilitas/HPP jalur template dengan jalur products; validasi peran dan cakupan stok.
- Satukan kontrak kelahiran SKU R&D/generator/master: induk valid, kombinasi eksplisit, lifecycle eksplisit; cegah varian yatim dan ambigu.
- Pastikan pemilihan varian sales mencocokkan seluruh atribut, tanpa fallback diam-diam ke SKU berbeda.
### P1
- Pengelolaan produk berbasis induk dengan atribut bebas, matriks kombinasi dan pengeditan varian.
- Model media per SKU: banyak foto, cover, urutan, tipe foto/mockup dan status publikasi.
- Hubungkan artwork/sampel R&D yang disetujui ke media varian; galeri sales desktop/mobile.
- Sambungkan mockup AI yang ada ke varian dengan persetujuan manusia sebelum ditampilkan ke customer.
- Perbaiki kontrak options[]/hex dan uji regresi lintas alur.
### P2
- Penyuntingan massal, pencarian/paginasi katalog besar, filter kelengkapan media.
- Mode presentasi pelanggan tanpa HPP/catatan internal.

## Langkah berikutnya
1. Sampaikan audit dan tunggu persetujuan perubahan kode.
2. Sepakati pemetaan R&D: satu keluarga dengan cakupan spesifikasi/approval per kombinasi; pertahankan semua referensi lama.
3. Tentukan provider/kredensial AI hanya ketika implementasi disetujui; jangan menganggap mode AI live sudah terverifikasi.
4. Buat rencana migrasi dry-run + uji terpadu R&D → varian → foto → sales sebelum implementasi bertahap.
