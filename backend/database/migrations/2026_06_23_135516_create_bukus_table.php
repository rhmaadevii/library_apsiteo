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
        Schema::create('bukus', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('judul');
            $table->string('pengarang');
            $table->string('kategori');
            $table->string('isbn');
            $table->string('tahun')->nullable();
            $table->string('cover')->nullable();
            $table->text('deskripsi')->nullable();
            $table->string('status')->default('available');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bukus');
    }
};
