<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('transaksis', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('buku_id');
            $table->foreign('buku_id')->references('id')->on('bukus')->onDelete('cascade');
            $table->date('tgl_pinjam');
            $table->date('tgl_kembali')->nullable();
            $table->date('jatuh_tempo');
            $table->string('status')->default('dipinjam'); // dipinjam, terlambat, selesai
            $table->integer('denda')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transaksis');
    }
};
