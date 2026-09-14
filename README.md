# WWhereibe Character + Supabase

Fitur:
- Pengunjung bisa melihat karakter dari HP/PC.
- Admin login dari website.
- Admin bisa tambah/edit/hapus karakter.
- Foto di-upload langsung dari website.
- Data tersimpan online di Supabase.

## SETUP
1. Buat project di Supabase.
2. Buka SQL Editor dan jalankan `supabase-setup.sql`.
3. Authentication > Users > Add user, lalu buat akun admin.
4. Project Settings > API, copy Project URL dan anon/public key.
5. Edit `js/config.js`, lalu masukkan kedua nilai tersebut.
6. Upload semua file ke repository GitHub Pages Anda dan Commit.
7. Tunggu deploy selesai, buka website, klik Login Admin.

Catatan: jangan membagikan password akun admin. Anon/public key boleh berada di frontend; pembatasan tulis diatur lewat RLS dan autentikasi.
