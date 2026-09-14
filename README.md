# Karakter Cerita — GitHub Pages

Website statis untuk menampilkan database karakter dan foto sehingga dapat dilihat dari HP maupun PC.

## Menambah karakter
1. Upload foto ke folder `images/`, misalnya `images/arul.jpg`.
2. Buka `data/characters.json` lalu tambahkan objek karakter baru dengan format yang sama seperti contoh.
3. Isi `image` dengan lokasi foto, misalnya `images/arul.jpg`.
4. Commit perubahan. GitHub Pages akan memperbarui situs.

> Catatan: GitHub Pages adalah hosting statis. Tombol upload langsung dari pengunjung tidak disediakan karena perubahan permanen harus disimpan kembali ke repository atau menggunakan backend/database terpisah.

## Publish
Repository > Settings > Pages > Build and deployment > Source: Deploy from a branch > Branch: main > /(root) > Save.
