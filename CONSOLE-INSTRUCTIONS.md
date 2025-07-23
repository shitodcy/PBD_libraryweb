# 🚀 Cara Menjalankan Aplikasi di Console/Terminal

## Langkah-langkah Lengkap:

### 1. Buka Terminal/Command Prompt
- **Windows**: Tekan `Win + R`, ketik `cmd`, tekan Enter
- **Mac**: Tekan `Cmd + Space`, ketik `terminal`, tekan Enter  
- **Linux**: Tekan `Ctrl + Alt + T`

### 2. Navigasi ke Folder Project
\`\`\`bash
# Ganti 'path/to/your/project' dengan lokasi folder project Anda
cd path/to/your/project

# Contoh:
# cd C:\Users\YourName\Documents\library-website
# cd ~/Documents/library-website
\`\`\`

### 3. Install Dependencies
\`\`\`bash
npm install
\`\`\`
**Output yang diharapkan:**
\`\`\`
added 234 packages, and audited 235 packages in 45s
found 0 vulnerabilities
\`\`\`

### 4. Setup Database
\`\`\`bash
npm run quick-setup
\`\`\`
**Output yang diharapkan:**
\`\`\`
🚀 Quick Setup for Library Management System
==================================================
1️⃣ Testing connection...
✅ Connection successful!

2️⃣ Creating essential tables...
✅ Essential tables created!

3️⃣ Inserting sample data...
✅ Sample data inserted!

4️⃣ Verifying setup...
✅ Books table accessible
📚 Sample books: Laskar Pelangi, Bumi Manusia, Hujan
✅ Categories table accessible
📂 Categories: Fiction, Non-Fiction, Technology, Education, Reference

🎉 Quick setup completed!
==================================================
Next steps:
1. Run: npm run dev
2. Visit: http://localhost:3000
3. Visit: http://localhost:3000/admin
\`\`\`

### 5. Jalankan Aplikasi
\`\`\`bash
npm run dev
\`\`\`
**Output yang diharapkan:**
\`\`\`
▲ Next.js 14.0.4
- Local:        http://localhost:3000
- Network:      http://192.168.1.100:3000

✓ Ready in 2.3s
\`\`\`

### 6. Buka Browser
Buka browser dan kunjungi:
- **Website Utama**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin
- **Katalog Buku**: http://localhost:3000/catalog

## 🔧 Troubleshooting

### Jika ada error "npm not found":
1. Install Node.js dari https://nodejs.org
2. Restart terminal
3. Coba lagi

### Jika ada error "permission denied":
\`\`\`bash
# Windows (run as administrator)
# Mac/Linux:
sudo npm install
\`\`\`

### Jika port 3000 sudah digunakan:
\`\`\`bash
npm run dev -- -p 3001
# Kemudian buka http://localhost:3001
\`\`\`

### Jika database connection error:
1. Pastikan file `.env.local` ada dan benar
2. Cek koneksi internet
3. Jalankan ulang `npm run quick-setup`

## 📱 Akses dari Device Lain
Jika ingin mengakses dari HP/tablet di jaringan yang sama:
1. Lihat IP address di output `npm run dev`
2. Buka `http://[IP-ADDRESS]:3000` di device lain
3. Contoh: `http://192.168.1.100:3000`

## 🛑 Menghentikan Aplikasi
Tekan `Ctrl + C` di terminal untuk menghentikan server
