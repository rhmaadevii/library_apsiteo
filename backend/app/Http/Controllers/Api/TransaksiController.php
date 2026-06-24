<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Transaksi;
use App\Models\Buku;
use Illuminate\Support\Facades\Auth;

class TransaksiController extends Controller
{
    public function index()
    {
        $transaksis = Transaksi::with(['user', 'buku'])->orderBy('created_at', 'desc')->get();
        
        // Map data to match frontend format
        $data = $transaksis->map(function($t) {
            return [
                'id' => $t->id,
                'studentNama' => $t->user->nama ?? 'Unknown',
                'studentUsername' => $t->user->username ?? '-',
                'buku' => $t->buku->judul ?? 'Unknown',
                'tglPinjam' => $t->tgl_pinjam ? date('d/m/Y', strtotime($t->tgl_pinjam)) : '-',
                'jatuhTempo' => $t->jatuh_tempo ? date('d/m/Y', strtotime($t->jatuh_tempo)) : '-',
                'status' => $t->status,
                'denda' => $t->denda
            ];
        });

        return response()->json($data);
    }

    public function kembalikan(Request $request, $id)
    {
        $transaksi = Transaksi::findOrFail($id);
        
        $transaksi->update([
            'status' => 'selesai',
            'tgl_kembali' => date('Y-m-d')
        ]);

        $buku = Buku::find($transaksi->buku_id);
        if ($buku) {
            $buku->update(['status' => 'available']);
        }

        return response()->json(['message' => 'Buku berhasil dikembalikan']);
    }

    public function ajukan(Request $request)
    {
        $request->validate(['id_buku' => 'required']);

        $buku = Buku::findOrFail($request->id_buku);
        if ($buku->status !== 'available') {
            return response()->json(['message' => 'Buku tidak tersedia'], 400);
        }

        $transaksi = Transaksi::create([
            'user_id' => Auth::id(),
            'buku_id' => $buku->id,
            'tgl_pinjam' => date('Y-m-d'),
            'jatuh_tempo' => date('Y-m-d', strtotime('+14 days')),
            'status' => 'dipinjam',
            'denda' => 0
        ]);

        $buku->update(['status' => 'unavailable']);

        return response()->json(['message' => 'Peminjaman berhasil diajukan', 'data' => $transaksi], 201);
    }
}
