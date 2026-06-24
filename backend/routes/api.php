<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BukuController;
use App\Http\Controllers\Api\AnggotaController;
use App\Http\Controllers\Api\TransaksiController;
use App\Http\Controllers\Api\ProfilController;
use App\Http\Controllers\Api\LaporanController;
use App\Http\Controllers\Api\DashboardController;

// Public auth routes
Route::post('/auth/login-admin', [AuthController::class, 'loginAdmin']);
Route::post('/auth/login-anggota', [AuthController::class, 'loginAnggota']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    
    // ======== ADMIN ROUTES ========
    // Dashboard
    Route::get('/admin/dashboard/stats', [DashboardController::class, 'stats']);
    Route::get('/admin/dashboard/transaksi-terbaru', [DashboardController::class, 'transaksiTerbaru']);
    Route::get('/admin/profil', [ProfilController::class, 'adminProfil']);

    // Buku (CRUD)
    Route::get('/buku', [BukuController::class, 'index']); // Anggota uses this too
    Route::post('/buku', [BukuController::class, 'store']);
    Route::put('/buku/{id}', [BukuController::class, 'update']);
    Route::delete('/buku/{id}', [BukuController::class, 'destroy']);

    // Anggota (CRUD)
    Route::get('/anggota', [AnggotaController::class, 'index']);
    Route::post('/anggota', [AnggotaController::class, 'store']);
    Route::put('/anggota/{id}', [AnggotaController::class, 'update']);
    Route::patch('/anggota/{id}/status', [AnggotaController::class, 'updateStatus']);

    // Transaksi (Admin)
    Route::get('/transaksi', [TransaksiController::class, 'index']);
    Route::patch('/transaksi/{id}/kembalikan', [TransaksiController::class, 'kembalikan']);

    // Laporan
    Route::get('/laporan/stats', [LaporanController::class, 'stats']);
    Route::get('/laporan/transaksi', [LaporanController::class, 'transaksi']);
    Route::get('/laporan/buku', [LaporanController::class, 'buku']);
    Route::get('/laporan/anggota', [LaporanController::class, 'anggota']);
    Route::get('/laporan/peminjaman', [LaporanController::class, 'peminjaman']);
    Route::get('/laporan/pengembalian', [LaporanController::class, 'pengembalian']);


    // ======== ANGGOTA ROUTES ========
    Route::post('/peminjaman/ajukan', [TransaksiController::class, 'ajukan']);
    Route::get('/anggota/riwayat-peminjaman', [ProfilController::class, 'riwayatPeminjaman']);
    Route::get('/anggota/profil', [ProfilController::class, 'anggotaProfil']);
    Route::put('/anggota/profil', [ProfilController::class, 'updateAnggotaProfil']);
});
