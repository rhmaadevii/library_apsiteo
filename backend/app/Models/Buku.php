<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Buku extends Model
{
    use HasFactory;

    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'judul',
        'pengarang',
        'kategori',
        'isbn',
        'tahun',
        'cover',
        'deskripsi',
        'status',
    ];

    public function transaksis()
    {
        return $this->hasMany(Transaksi::class, 'buku_id', 'id');
    }
}
