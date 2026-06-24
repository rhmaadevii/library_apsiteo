<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Transaksi;

class ProfilController extends Controller
{
    public function adminProfil()
    {
        return response()->json(Auth::user());
    }

    public function anggotaProfil()
    {
        return response()->json(Auth::user());
    }

    public function updateAnggotaProfil(Request $request)
    {
        $user = Auth::user();
        
        $data = $request->only(['nama', 'username', 'email', 'no_hp', 'alamat']);
        
        if ($request->filled('password')) {
            $data['password'] = \Hash::make($request->password);
        }

        $user->update($data);

        return response()->json($user);
    }

    public function riwayatPeminjaman()
    {
        $transaksis = Transaksi::with('buku')
            ->where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get();

        $data = $transaksis->map(function($t) {
            $isSelesai = $t->status === 'selesai';
            $isTerlambat = $t->status === 'terlambat';
            
            $item = [
                'id' => $t->id,
                'judul' => $t->buku->judul ?? 'Unknown',
                'penulis' => $t->buku->pengarang ?? 'Unknown',
                'status' => $t->status,
                'tanggal_pinjam' => $t->tgl_pinjam ? date('d/m/Y', strtotime($t->tgl_pinjam)) : '-',
                'jatuh_tempo' => $t->jatuh_tempo ? date('d/m/Y', strtotime($t->jatuh_tempo)) : '-',
                'denda' => $t->denda
            ];

            if ($isSelesai) {
                $item['tanggal_kembali'] = $t->tgl_kembali ? date('d/m/Y', strtotime($t->tgl_kembali)) : '-';
            }
            if ($isTerlambat) {
                $tgl_jt = strtotime($t->jatuh_tempo);
                $now = time();
                $diff = $now - $tgl_jt;
                $item['terlambat_hari'] = max(0, floor($diff / (60 * 60 * 24)));
            }

            return $item;
        });

        return response()->json($data);
    }
}
