<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Buku;
use App\Models\User;
use App\Models\Transaksi;

class DashboardController extends Controller
{
    public function stats()
    {
        $totalBuku = Buku::count();
        $totalAnggota = User::where('role', 'anggota')->count();
        $dipinjam = Transaksi::whereIn('status', ['dipinjam', 'terlambat'])->count();
        $dendaAktif = Transaksi::where('status', 'terlambat')->sum('denda');

        return response()->json([
            'totalBuku' => $totalBuku,
            'totalAnggota' => $totalAnggota,
            'dipinjam' => $dipinjam,
            'dendaAktif' => $dendaAktif
        ]);
    }

    public function transaksiTerbaru()
    {
        $transaksis = Transaksi::with(['user', 'buku'])
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        $data = $transaksis->map(function($t) {
            return [
                'anggota' => $t->user->nama ?? 'Unknown',
                'buku' => $t->buku->judul ?? 'Unknown',
                'tanggalPinjam' => $t->tgl_pinjam ? date('d/m/Y', strtotime($t->tgl_pinjam)) : '-',
                'status' => $t->status == 'selesai' ? 'kembali' : $t->status // map to frontend expected status
            ];
        });

        return response()->json($data);
    }
}
