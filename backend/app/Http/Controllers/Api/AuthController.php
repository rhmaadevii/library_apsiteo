<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;

class AuthController extends Controller
{
    public function loginAdmin(Request $request)
    {
        $request->validate([
            'identifier' => 'required',
            'password' => 'required'
        ]);

        $user = User::where('username', $request->identifier)
            ->orWhere('email', $request->identifier)
            ->first();

        if (!$user || !\Hash::check($request->password, $user->password) || $user->role !== 'admin') {
            return response()->json(['message' => 'Username/email atau password yang Anda masukkan salah, atau Anda bukan Admin.'], 401);
        }

        $token = $user->createToken('admin-token')->plainTextToken;
        return response()->json(['token' => $token, 'role' => $user->role]);
    }

    public function loginAnggota(Request $request)
    {
        $request->validate([
            'identifier' => 'required',
            'password' => 'required'
        ]);

        $user = User::where('username', $request->identifier)
            ->orWhere('email', $request->identifier)
            ->first();

        if (!$user || !\Hash::check($request->password, $user->password) || $user->role !== 'anggota') {
            return response()->json(['message' => 'Username/email atau password yang Anda masukkan salah.'], 401);
        }

        if ($user->status !== 'aktif') {
            return response()->json(['message' => 'Akun Anda sedang nonaktif.'], 403);
        }

        $token = $user->createToken('anggota-token')->plainTextToken;
        return response()->json(['token' => $token, 'role' => $user->role]);
    }
}
