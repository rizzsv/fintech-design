# Business Rules

## 1. General Rules

- Semua data finansial harus berdasarkan user yang sedang login.
- Controller tidak boleh menjalankan query Prisma secara langsung.
- Business logic harus berada di service atau use case.
- Query database harus melalui repository.
- Data finansial tidak boleh menggunakan floating-point untuk perhitungan uang.

## 2. User and Account

- User harus memiliki email yang unik.
- User harus memiliki nomor telepon yang unik.
- User dengan `isActive = false` tidak boleh melakukan transaksi.
- User yang sudah dihapus secara soft delete tidak boleh login.
- Password tidak boleh dikembalikan melalui API.
- Email verification token tidak boleh dikembalikan melalui API.

## 3. Email Verification

- User dapat login sesuai aturan autentikasi yang berlaku.
- Status email verification harus berasal dari `isEmailVerified`.
- Token verifikasi harus memiliki masa berlaku.
- Token yang sudah digunakan tidak boleh digunakan kembali.
- Token verifikasi tidak boleh ditampilkan di response API.

## 4. KYC

- Status KYC dapat berupa `PENDING`, `APPROVED`, atau `REJECTED`
  sesuai enum yang tersedia di project.
- Tier KYC menentukan batas transaksi user.
- User dengan KYC yang belum memenuhi syarat tidak boleh melakukan
  transaksi yang membutuhkan tier lebih tinggi.
- Dokumen KYC tidak boleh ditampilkan pada response publik.
- Path dokumen dan selfie hanya boleh digunakan oleh service internal
  yang memiliki hak akses.

## 5. Wallet

- Satu user hanya boleh memiliki wallet sesuai aturan schema.
- Wallet harus dimiliki oleh user yang valid.
- Wallet yang tidak aktif tidak boleh digunakan untuk transaksi.
- Saldo wallet tidak boleh diubah secara sembarangan.
- Perubahan saldo harus memiliki pencatatan ledger atau transaksi finansial
  yang sesuai.
- `Wallet.balance` hanya boleh dianggap sebagai saldo yang telah dihitung
  atau dicache sesuai arsitektur project.

## 6. Money

- Nilai uang disimpan menggunakan tipe decimal atau tipe yang aman.
- Nilai uang dikirim melalui API sebagai string desimal.
- Perhitungan finansial tidak boleh menggunakan JavaScript floating-point.
- Currency harus konsisten dengan wallet atau transaksi terkait.
- Nilai uang tidak boleh bernilai negatif kecuali aturan transaksi
  memang mengizinkannya.

## 7. Transfer

- User hanya boleh melakukan transfer jika akunnya aktif.
- Wallet pengirim harus aktif.
- Saldo pengirim harus mencukupi.
- Transfer harus memiliki status yang jelas.
- Transfer tidak boleh diproses dua kali.
- Transfer harus mendukung idempotency jika endpoint terkait
  memang menggunakannya.
- Transfer yang berhasil harus tercatat pada ledger.
- Transfer gagal tidak boleh mengurangi saldo secara permanen.
- User tidak boleh mengakses transaksi milik user lain.

## 8. Transaction Status

- `PENDING` berarti transaksi masih diproses.
- `SUCCESS` berarti transaksi berhasil.
- `FAILED` berarti transaksi gagal.
- `CANCELLED` berarti transaksi dibatalkan.
- `REVERSED` berarti transaksi yang sebelumnya berhasil telah dibalik.

Gunakan enum yang benar-benar tersedia di Prisma schema.

## 9. Dashboard

- Endpoint dashboard hanya membaca data.
- Endpoint dashboard tidak boleh mengubah saldo.
- Endpoint dashboard tidak boleh membuat transaksi.
- Ringkasan finansial hanya menghitung transaksi yang memenuhi aturan
  status berhasil.
- Recent transactions hanya menampilkan transaksi milik user yang login.
- Limit dashboard harus konsisten dengan limit yang digunakan oleh
  transfer service.