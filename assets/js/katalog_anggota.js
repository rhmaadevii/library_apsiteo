// ===========================================
// katalog.js — Logic katalog buku, pencarian, dan ajukan peminjaman (Anggota)
// ===========================================



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
    const isTersedia = book.status === "available";
    const card = document.createElement("div");
    card.className = "book-card";
    card.innerHTML = `
      <div class="book-cover"${book.cover ? ` style="background-image: url('${book.cover}'); background-size: cover; background-position: center;"` : ''}></div>
      <div class="book-info">
        <div class="book-title">${book.judul}</div>
        <div class="book-author">${book.pengarang}</div>
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
  const isTersedia = book.status === "available";

  document.getElementById("modalTitle").textContent = book.judul;
  document.getElementById("modalAuthor").textContent = book.pengarang;

  const modalCover = document.querySelector(".modal-cover");
  if (book.cover) {
    modalCover.style.backgroundImage = `url('${book.cover}')`;
    modalCover.style.backgroundSize = "cover";
    modalCover.style.backgroundPosition = "center";
  } else {
    modalCover.style.backgroundImage = "none";
  }

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
  // --- MODE ASLI: ambil dari backend ---
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
  apiRequest("/anggota/profil", "GET").then(res => {
    document.getElementById("userName").textContent = res.nama || "Anggota";
  }).catch(() => {
    document.getElementById("userName").textContent = "Anggota";
  });

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
    if (!selectedBook || selectedBook.status !== "available") return;

    pinjamBtn.disabled = true;
    pinjamSpinner.classList.add("show");
    pinjamLabel.textContent = "Memproses...";

    try {
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