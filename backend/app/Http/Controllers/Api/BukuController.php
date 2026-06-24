<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Buku;

class BukuController extends Controller
{
    public function index(Request $request)
    {
        $query = Buku::query();
        if ($request->has('keyword')) {
            $kw = $request->keyword;
            $query->where('judul', 'like', "%{$kw}%")
                  ->orWhere('pengarang', 'like', "%{$kw}%")
                  ->orWhere('isbn', 'like', "%{$kw}%");
        }
        // sort by newest added
        $query->orderBy('created_at', 'desc');
        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'judul' => 'required',
            'pengarang' => 'required',
            'isbn' => 'required'
        ]);

        $buku = Buku::create([
            'id' => uniqid('BK-'),
            'judul' => $request->judul,
            'pengarang' => $request->pengarang,
            'kategori' => $request->genre ?? 'Umum',
            'isbn' => $request->isbn,
            'tahun' => $request->tahun,
            'cover' => $request->cover,
            'deskripsi' => $request->deskripsi,
            'status' => 'available'
        ]);

        return response()->json($buku, 201);
    }

    public function update(Request $request, $id)
    {
        $buku = Buku::findOrFail($id);
        
        $buku->update($request->only(['judul', 'pengarang', 'status']));

        return response()->json($buku);
    }

    public function destroy($id)
    {
        $buku = Buku::findOrFail($id);
        $buku->delete();
        
        return response()->json(['message' => 'Buku berhasil dihapus']);
    }
}
