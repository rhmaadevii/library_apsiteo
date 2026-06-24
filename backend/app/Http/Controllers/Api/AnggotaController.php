<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AnggotaController extends Controller
{
    public function index()
    {
        $anggota = User::where('role', 'anggota')->orderBy('created_at', 'desc')->get();
        return response()->json($anggota);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama' => 'required',
            'username' => 'required|unique:users',
            'password' => 'required',
            'email' => 'required|email|unique:users'
        ]);

        $anggota = User::create([
            'nama' => $request->nama,
            'username' => $request->username,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'no_hp' => $request->noHp,
            'alamat' => $request->alamat,
            'tanggal_daftar' => $request->tanggalDaftar ?? date('Y-m-d'),
            'role' => 'anggota',
            'status' => 'aktif'
        ]);

        return response()->json($anggota, 201);
    }

    public function update(Request $request, $id)
    {
        $anggota = User::where('role', 'anggota')->findOrFail($id);

        $anggota->update([
            'nama' => $request->nama ?? $anggota->nama,
            'username' => $request->username ?? $anggota->username,
            'email' => $request->email ?? $anggota->email,
            'no_hp' => $request->noHp ?? $anggota->no_hp,
            'alamat' => $request->alamat ?? $anggota->alamat,
            'status' => $request->status ?? $anggota->status,
        ]);

        return response()->json($anggota);
    }

    public function updateStatus(Request $request, $id)
    {
        $anggota = User::where('role', 'anggota')->findOrFail($id);
        
        $request->validate(['status' => 'required|in:aktif,nonaktif']);
        
        $anggota->update(['status' => $request->status]);

        return response()->json(['message' => 'Status berhasil diubah']);
    }
}
