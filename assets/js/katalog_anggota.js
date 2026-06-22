// ===========================================
// katalog.js — Logic katalog buku, pencarian, dan ajukan peminjaman (Anggota)
// ===========================================

// ⚠️ SIMULASI SEMENTARA — ganti SIMULATION_MODE jadi false
// kalau backend dari temenmu sudah siap dan endpoint sudah dipasang.
const SIMULATION_MODE = true;

const DUMMY_BOOKS = [
  { id: 1, judul: "The Great Gatsby", penulis: "F. Scott Fitzgerald", status: "tersedia" },
  { id: 2, judul: "Who You Are", penulis: "Indah Kus", status: "habis" },
  { id: 3, judul: "Money Oriented", penulis: "F. Scott Fitzgerald", status: "tersedia" },
  { id: 4, judul: "To Kill a Mockingbird", penulis: "Harper Lee", status: "tersedia" },
  { id: 5, judul: "1984", penulis: "George Orwell", status: "habis" },
  { id: 6, judul: "Laskar Pelangi", penulis: "Andrea Hirata", status: "tersedia" },
];

let allBooks = [];
let selectedBook = null;

function renderBooks(books) {
  const grid = document.getElementById("bookGrid");
  const emptyState = document.getElementById("emptyState");

  grid.innerHTML = "";

  if (books.length === 0) {
    emptyState.classList.add("show");
    return;
  }
  emptyState.classList.remove("show");

  books.forEach((book) => {
    const isTersedia = book.status === "tersedia";
    const card = document.createElement("div");
    card.className = "book-card";
    card.innerHTML = `
      <div class="book-cover"></div>
      <div class="book-info">
        <div class="book-title">${book.judul}</div>
        <div class="book-author">${book.penulis}</div>
        <div class="book-footer">
          <span class="badge ${isTersedia ? "tersedia" : "habis"}">${isTersedia ? "Tersedia" : "Habis"}</span>
          <button class="btn-pinjam-mini" data-id="${book.id}" ${isTersedia ? "" : "disabled"}>Pinjam</button>
        </div>
      </div>
    `;

    // klik card (selain tombol pinjam mini) buka modal detail
    card.addEventListener("click", (e) => {
      if (e.target.closest(".btn-pinjam-mini")) return;
      openModal(book);
    });

    // klik tombol pinjam mini langsung buka modal juga (lebih konsisten & aman)
    const miniBtn = card.querySelector(".btn-pinjam-mini");
    miniBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      openModal(book);
    });

    grid.appendChild(card);
  });
}

function openModal(book) {
  selectedBook = book;
  const isTersedia = book.status === "tersedia";

  document.getElementById("modalTitle").textContent = book.judul;
  document.getElementById("modalAuthor").textContent = book.penulis;

  const badge = document.getElementById("modalBadge");
  badge.textContent = isTersedia ? "Tersedia" : "Habis";
  badge.className = "badge " + (isTersedia ? "tersedia" : "habis");

  const pinjamBtn = document.getElementById("modalPinjamBtn");
  pinjamBtn.disabled = !isTersedia;
  document.getElementById("pinjamLabel").textContent = isTersedia
    ? "Ajukan Peminjaman"
    : "Stok Tidak Tersedia";

  document.getElementById("modalOverlay").classList.add("show");
}

function closeModal() {
  document.getElementById("modalOverlay").classList.remove("show");
  selectedBook = null;
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2500);
}

async function loadBooks(keyword = "") {
  if (SIMULATION_MODE) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    let books = DUMMY_BOOKS;
    if (keyword.trim() !== "") {
      const kw = keyword.trim().toLowerCase();
      books = DUMMY_BOOKS.filter(
        (b) => b.judul.toLowerCase().includes(kw) || b.penulis.toLowerCase().includes(kw)
      );
    }
    allBooks = books;
    renderBooks(books);
    return;
  }

  // --- MODE ASLI: ambil dari backend ---
  // TODO: ganti endpoint sesuai backend, misal "/buku" atau "/buku?keyword=..."
  try {
    const endpoint = keyword.trim() !== "" ? `/buku?keyword=${encodeURIComponent(keyword)}` : "/buku";
    const result = await apiRequest(endpoint, "GET");
    allBooks = result;
    renderBooks(result);
  } catch (err) {
    showToast("Gagal memuat data buku.");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  const modalOverlay = document.getElementById("modalOverlay");
  const modalClose = document.getElementById("modalClose");
  const pinjamBtn = document.getElementById("modalPinjamBtn");
  const pinjamSpinner = document.getElementById("pinjamSpinner");
  const pinjamLabel = document.getElementById("pinjamLabel");
  const logoutLink = document.getElementById("logoutLink");

  // Nama user diambil dari data profil yang tersimpan (hasil login / edit profil),
  // BUKAN hardcode — supaya otomatis ikut akun yang sedang login.
  const savedProfile = localStorage.getItem("dummy_profile");
  if (savedProfile) {
    const profile = JSON.parse(savedProfile);
    document.getElementById("userName").textContent = profile.nama || "Anggota";
  } else {
    // fallback kalau anggota belum pernah buka halaman profil di sesi ini
    document.getElementById("userName").textContent = "Inas Amatullah";
  }

  // debounce search biar nggak fetch tiap ketikan huruf
  let searchTimeout;
  searchInput.addEventListener("input", (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => loadBooks(e.target.value), 350);
  });

  modalClose.addEventListener("click", closeModal);
  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  pinjamBtn.addEventListener("click", async () => {
    if (!selectedBook || selectedBook.status !== "tersedia") return;

    pinjamBtn.disabled = true;
    pinjamSpinner.classList.add("show");
    pinjamLabel.textContent = "Memproses...";

    try {
      if (SIMULATION_MODE) {
        await new Promise((resolve) => setTimeout(resolve, 700));
        closeModal();
        showToast(`Peminjaman "${selectedBook.judul}" berhasil diajukan.`);
        return;
      }

      // --- MODE ASLI: kirim pengajuan peminjaman ke backend ---
      // TODO: ganti endpoint sesuai backend, misal "/peminjaman/ajukan"
      await apiRequest("/peminjaman/ajukan", "POST", { id_buku: selectedBook.id });
      closeModal();
      showToast(`Peminjaman "${selectedBook.judul}" berhasil diajukan.`);
      loadBooks(searchInput.value); // refresh stok terbaru

    } catch (err) {
      showToast(err.message || "Gagal mengajukan peminjaman.");
    } finally {
      pinjamBtn.disabled = false;
      pinjamSpinner.classList.remove("show");
      pinjamLabel.textContent = "Ajukan Peminjaman";
    }
  });

  // Logout sekarang ditangani oleh logout-confirm.js (modal konfirmasi)

  loadBooks();
});