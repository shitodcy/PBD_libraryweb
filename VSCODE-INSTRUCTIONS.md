# 🚀 Cara Menjalankan Aplikasi di VS Code

## Langkah-langkah Lengkap:

### 1. Buka VS Code
- Buka Visual Studio Code
- File → Open Folder → Pilih folder project Anda

### 2. Buka Terminal di VS Code
- **Cara 1**: Terminal → New Terminal
- **Cara 2**: Tekan `Ctrl + Shift + `` (backtick)
- **Cara 3**: View → Terminal

### 3. Jalankan 3 Perintah Ini Secara Berurutan:

#### Install Dependencies
\`\`\`bash
npm install
\`\`\`
*Tunggu sampai selesai (1-2 menit)*

#### Setup Database
\`\`\`bash
npm run quick-setup
\`\`\`
*Output yang diharapkan:*
\`\`\`
🚀 Quick Setup for Library Management System
==================================================
✅ Connection successful!
✅ Essential tables created!
✅ Sample data inserted!
🎉 Quick setup completed!
\`\`\`

#### Jalankan Aplikasi
\`\`\`bash
npm run dev
\`\`\`
*Output yang diharapkan:*
\`\`\`
▲ Next.js 14.0.4
- Local:        http://localhost:3000
✓ Ready in 2.3s
\`\`\`

### 4. Buka Browser
Klik link yang muncul di terminal atau buka manual:
- **🏠 Website Utama**: http://localhost:3000
- **👨‍💼 Admin Panel**: http://localhost:3000/admin

### 5. Fitur VS Code yang Berguna:

#### Auto-completion
- VS Code akan memberikan suggestions saat mengetik
- Tekan `Ctrl + Space` untuk melihat suggestions

#### File Explorer
- Panel kiri menampilkan struktur folder
- Klik file untuk membuka

#### Extensions yang Direkomendasikan:
- **ES7+ React/Redux/React-Native snippets**
- **Tailwind CSS IntelliSense**
- **TypeScript Importer**
- **Auto Rename Tag**

### 6. Debugging di VS Code:
- Set breakpoint dengan klik di sebelah kiri nomor baris
- F5 untuk start debugging
- F10 untuk step over
- F11 untuk step into

### 7. Integrated Git:
- Source Control panel (Ctrl + Shift + G)
- Commit changes langsung dari VS Code
- Push/pull dari integrated terminal

## 🎯 Hasil yang Diharapkan:

✅ **Website Perpustakaan** dengan tampilan modern
✅ **Admin Dashboard** untuk CRUD operations
✅ **Database** dengan sample data lengkap
✅ **Hot Reload** - perubahan code langsung terlihat
✅ **TypeScript Support** dengan error checking
✅ **Tailwind CSS** untuk styling

## 🛑 Untuk Menghentikan:
- Tekan `Ctrl + C` di terminal VS Code
- Atau tutup terminal

## 📱 Akses dari Device Lain:
- Lihat Network URL di output terminal
- Contoh: http://192.168.1.100:3000
- Buka di HP/tablet yang terhubung WiFi sama

Selamat! Sistem perpustakaan digital Anda siap digunakan! 🎉
