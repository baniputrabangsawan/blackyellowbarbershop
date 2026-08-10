# Arsitektur Real-Time Next.js + Supabase

Dokumen ini menjelaskan bagaimana fitur *auto-refresh* (real-time) bekerja secara penuh di halaman utama Black Yellow Barbershop. Fitur ini memungkinkan setiap perubahan di *Dashboard Admin* (seperti menghapus galeri, mengubah layanan, atau mematikan status toko) langsung muncul di layar pengunjung tanpa mereka perlu menekan tombol *refresh* browser.

Sistem ini sangat efisien karena kita tidak mengubah komponen *server* (Server Components) menjadi komponen *client*. Kita memanfaatkan fitur canggih bawaan Next.js 14+ bernama **Background Refresh**.

Berikut adalah 4 langkah utama penyusun sistem *real-time* ini:

## 1. Konfigurasi Database (Supabase Publication)
Secara bawaan (*default*), PostgreSQL tidak akan memberitahu siapa-siapa jika ada data yang berubah. Agar database memancarkan (*broadcast*) sinyal saat ada data yang berubah, tabel-tabel tersebut harus dimasukkan ke dalam "saluran radio" khusus milik Supabase.

**Yang kita lakukan:**
Kita menjalankan *query* SQL untuk mendaftarkan tabel-tabel operasional ke publikasi `supabase_realtime`:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE 
  galleries, services, barbers, branches, business_hours, faqs, promos;
```
*(Catatan: Anda tidak perlu menaruh tabel rahasia seperti `admin_users` ke sini demi keamanan).*

**Hasilnya:** Setiap kali admin melakukan *Insert*, *Update*, atau *Delete* pada tabel tersebut, Supabase akan memancarkan data perubahan via protokol WebSocket ke seluruh koneksi yang terbuka.

---

## 2. Mematikan Caching Statis (Server Level)
Next.js memiliki mekanisme *cache* yang sangat agresif. Jika sebuah halaman tidak membaca *Cookies* atau *URL Parameters*, Next.js menganggap halaman itu statis. Akibatnya, halaman itu di-*render* satu kali saja dan disimpan di memori permanen (*cache*).

**Yang kita lakukan:**
Kita mematikan *cache* statis tersebut pada halaman `src/app/page.tsx` dengan menambahkan satu baris instruksi:
```typescript
export const dynamic = 'force-dynamic';
```

**Hasilnya:** Kita memaksa *server* Next.js agar selalu menarik data terbaru dan segar langsung dari database setiap kali *browser* meminta render ulang, alih-alih memberikan data basi (*stale*) dari *cache*.

---

## 3. Komponen Pendengar Sinyal (Client Level)
Agar *browser* pengunjung bisa "mendengar" siaran radio WebSocket dari Supabase, kita membutuhkan sebuah pendengar (*listener*) yang berjalan di *background*.

**Yang kita lakukan:**
Kita membuat komponen `src/components/realtime-refresh.tsx` (*Client Component*) yang ditanamkan ke dalam `page.tsx`. Komponen ini melakukan *subscribe* ke seluruh kejadian (`*`) di dalam *database* utama (`public`).

```typescript
const channel = supabase
  .channel(`global-app-refresh-${channelId}`)
  .on(
    'postgres_changes',
    { event: '*', schema: 'public' }, // Dengarkan seluruh tabel di schema public
    (payload) => {
      // Pemicu aksi saat ada data yang berubah
      router.refresh();
    }
  )
  .subscribe();
```

---

## 4. Background Refresh (Router Level)
Ini adalah bagian *"Magic"*-nya. Kita tidak menggunakan `window.location.reload()` karena itu akan memuat ulang seluruh aset halaman dan menyebabkan layar berkedip putih.

**Yang kita lakukan:**
Kita menggunakan `router.refresh()` milik Next.js saat sinyal Supabase tiba.

**Alur Kejadian Sempurna (Step-by-step):**
1. Anda masuk ke Admin dan **menghapus 1 foto Galeri**.
2. *Database* Postgres menghapus foto tersebut.
3. Supabase melihat ini dan menembakkan pesan WebSocket berbunyi: *"Ada perubahan di tabel galleries!"*
4. Komponen `realtime-refresh.tsx` di *browser* pengunjung menangkap pesan tersebut.
5. Komponen memicu perintah `router.refresh()`.
6. Secara diam-diam (di belakang layar), *browser* meminta *server* Next.js merender ulang HTML halaman utama.
7. Karena kita menggunakan `force-dynamic` (Langkah 2), *server* mematuhi perintah dengan melakukan *query* ulang ke *database* (mendapatkan sisa foto galeri yang benar).
8. *Server* mengirim paket komponen (RSC Payload) yang baru ke *browser*.
9. React DOM di *browser* menyuntikkan dan membandingkan DOM baru ini dengan sangat halus tanpa mengubah posisi *scroll* layar pengunjung. 
10. **Foto yang dihapus tiba-tiba menghilang dari pandangan pengunjung dengan mulus!**
