<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Buku;
use App\Models\Transaksi;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        // Admin
        User::create([
            'nama' => 'Admin Name',
            'username' => 'admin',
            'email' => 'admin@example.com',
            'password' => bcrypt('admin123'),
            'role' => 'admin',
            'status' => 'aktif'
        ]);

        // Anggota
        $anggota1 = User::create([
            'nama' => 'Inas Amatullah',
            'username' => 'inas.a',
            'email' => 'inas.amtllh@gmail.com',
            'password' => bcrypt('anggota123'),
            'no_hp' => '+62 8125823582',
            'alamat' => 'Jl. Cemara No. 1',
            'tanggal_daftar' => '2026-06-14',
            'role' => 'anggota',
            'status' => 'aktif'
        ]);

        User::create([
            'nama' => 'Rahmadevi Inas',
            'username' => 'anggota',
            'email' => 'rhmainas@gmail.com',
            'password' => bcrypt('anggota123'),
            'no_hp' => '+62 81234578',
            'alamat' => '-',
            'tanggal_daftar' => '2026-06-14',
            'role' => 'anggota',
            'status' => 'nonaktif'
        ]);

        // Buku
        $buku1 = Buku::create([
            'id' => '678-0004',
            'judul' => 'Sapiens: A Brief History of Humankind',
            'pengarang' => 'Yuval Noah Harari',
            'kategori' => 'History',
            'isbn' => '978-0771038501',
            'status' => 'available'
        ]);

        $buku2 = Buku::create([
            'id' => '678-0002',
            'judul' => 'To Kill a Mocking Bird',
            'pengarang' => 'Harper Lee',
            'kategori' => 'Fiction',
            'isbn' => '978-0446310789',
            'status' => 'available'
        ]);

        $buku3 = Buku::create([
            'id' => '678-0003',
            'judul' => 'The Great Gatsby',
            'pengarang' => 'F. Scott Fitzgerald',
            'kategori' => 'Fiction',
            'isbn' => '978-0743273565',
            'status' => 'unavailable'
        ]);

        // Transaksi
        Transaksi::create([
            'user_id' => $anggota1->id,
            'buku_id' => $buku3->id,
            'tgl_pinjam' => '2026-06-01',
            'tgl_kembali' => null,
            'jatuh_tempo' => '2026-06-15',
            'status' => 'terlambat',
            'denda' => 15000
        ]);
    }
}
