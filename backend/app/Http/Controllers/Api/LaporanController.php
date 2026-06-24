<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Transaksi;
use App\Models\Buku;
use App\Models\User;

class LaporanController extends Controller
{
    private function applyDateFilter($query, $request)
    {
        if ($request->has('start') && $request->start) {
            $query->where('tgl_pinjam', '>=', $request->start);
        }
        if ($request->has('end') && $request->end) {
            $query->where('tgl_pinjam', '<=', $request->end);
        }
        return $query;
    }

    public function stats(Request $request)
    {
        $query = Transaksi::query();
        $this->applyDateFilter($query, $request);
        
        $transaksis = $query->get();
        
        $totalTransaksi = $transaksis->count();
        $bukuDipinjam = $transaksis->pluck('buku_id')->unique()->count();
        $anggotaAktif = User::where('role', 'anggota')->where('status', 'aktif')->count();
        $totalDenda = $transaksis->sum('denda');

        return response()->json([
            'totalTransaksi' => $totalTransaksi,
            'bukuDipinjam' => $bukuDipinjam,
            'anggotaAktif' => $anggotaAktif,
            'totalDenda' => $totalDenda
        ]);
    }

    private function mapTransaksi($t)
    {
        return [
            'anggota' => $t->user->nama ?? 'Unknown',
            'buku' => $t->buku->judul ?? 'Unknown',
            'tglPinjam' => $t->tgl_pinjam,
            'tglKembali' => $t->tgl_kembali,
            'status' => $t->status,
            'denda' => $t->denda
        ];
    }

    public function transaksi(Request $request)
    {
        $query = Transaksi::with(['user', 'buku']);
        $this->applyDateFilter($query, $request);
        
        return response()->json($query->get()->map(fn($t) => $this->mapTransaksi($t)));
    }

    public function buku()
    {
        return response()->json(Buku::all());
    }

    public function anggota()
    {
        return response()->json(User::where('role', 'anggota')->get());
    }

    public function peminjaman(Request $request)
    {
        $query = Transaksi::with(['user', 'buku'])->whereIn('status', ['dipinjam', 'terlambat']);
        $this->applyDateFilter($query, $request);
        
        return response()->json($query->get()->map(fn($t) => $this->mapTransaksi($t)));
    }

    public function pengembalian(Request $request)
    {
        $query = Transaksi::with(['user', 'buku'])->where('status', 'selesai');
        $this->applyDateFilter($query, $request);
        
        return response()->json($query->get()->map(fn($t) => $this->mapTransaksi($t)));
    }
}
