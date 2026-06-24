// ===========================================
// kelola_buku.js — Logic CRUD Kelola Buku (Admin)
// ===========================================

let DUMMY_BUKU = [];

let allBuku = [];
let selectedId = null; // untuk edit & hapus
let nextId = 5; // counter untuk generate id buku dummy baru

// ===== UTIL =====
function generateId() {
  return `678-000${nextId++}`;
}

function showToast(message, isError = false) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.style.background = isError ? "#a01c1c" : "#1d3b2f";
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2500);
}

function openModal(id) { document.getElementById(id).classList.add("show"); }
function closeModal(id) { document.getElementById(id).classList.remove("show"); }

// ===== RENDER TABEL =====
function renderTable(data) {
  const tbody = document.getElementById("bukuBody");

  if (!data || data.length === 0) {
    tbody.innerHTML = `<tr class="empty-row"><td colspan="6">Tidak ada buku ditemukan.</td></tr>`;
    return;
  }

  tbody.innerHTML = data.map((b) => `
    <tr data-id="${b.id}">
      <td>
        <div class="buku-cell">
          <div class="buku-thumb"${b.cover ? ` style="background-image: url('${b.cover}'); background-size: cover; background-position: center;"` : ''}></div>
          <div>
            <div class="buku-judul">${b.judul}</div>
            <div class="buku-penulis">${b.pengarang}</div>
          </div>
        </div>
      </td>
      <td><span class="badge-kategori">${b.kategori}</span></td>
      <td>${b.id}</td>
      <td>${b.isbn}</td>
      <td><span class="availability ${b.status}">${b.status === "available" ? "Available" : "Unavailable"}</span></td>
      <td>
        <div class="action-cell">
          <button class="action-btn edit" data-id="${b.id}" title="Edit">
            <svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="action-btn del" data-id="${b.id}" title="Hapus">
            <svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          </button>
        </div>
      </td>
    </tr>
  `).join("");

  // pasang event ke tombol edit & hapus
  tbody.querySelectorAll(".action-btn.edit").forEach((btn) => {
    btn.addEventListener("click", () => openEditModal(btn.dataset.id));
  });
  tbody.querySelectorAll(".action-btn.del").forEach((btn) => {
    btn.addEventListener("click", () => openDeleteModal(btn.dataset.id));
  });
}

// ===== LOAD DATA =====
async function loadBuku(keyword = "") {

  try {
    const endpoint = keyword.trim() ? `/buku?keyword=${encodeURIComponent(keyword)}` : "/buku";
    const result = await apiRequest(endpoint, "GET");
    allBuku = result;
    DUMMY_BUKU = result;
    renderTable(result);
  } catch (err) {
    showToast("Gagal memuat data buku.", true);
  }
}

// ===== TAMBAH BUKU =====
async function tambahBuku(data) {

  return await apiRequest("/buku", "POST", data);
}

// ===== EDIT BUKU =====
async function editBuku(id, data) {

  return await apiRequest(`/buku/${id}`, "PUT", data);
}

// ===== HAPUS BUKU =====
async function hapusBuku(id) {

  await apiRequest(`/buku/${id}`, "DELETE");
}

// ===== OPEN MODAL EDIT =====
function openEditModal(id) {
  const buku = DUMMY_BUKU.find((b) => b.id === id);
  if (!buku) return;
  selectedId = id;
  document.getElementById("e_judul").value = buku.judul;
  document.getElementById("e_pengarang").value = buku.pengarang;
  document.getElementById("e_status").value = buku.status;
  openModal("modalEdit");
}

// ===== OPEN MODAL HAPUS =====
function openDeleteModal(id) {
  selectedId = id;
  openModal("modalHapus");
}

// ===== RESET FORM TAMBAH =====
function resetFormTambah() {
  ["t_judul", "t_pengarang", "t_isbn", "t_genre", "t_tahun", "t_cover", "t_deskripsi"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) { el.value = ""; el.classList.remove("invalid"); }
  });
}

// ===== DOMContentLoaded =====
document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  const formTambah = document.getElementById("formTambah");
  const formEdit = document.getElementById("formEdit");
  const btnKonfirmasiHapus = document.getElementById("btnKonfirmasiHapus");
  const logoutBtn = document.getElementById("logoutBtn");
  const logoutModal = document.getElementById("logoutModal");

  // nama admin
  apiRequest("/admin/profil", "GET").then(res => {
    if (res && res.nama) document.getElementById("adminName").textContent = res.nama;
  }).catch(() => {});

  // search debounce
  let searchTimeout;
  searchInput.addEventListener("input", (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => loadBuku(e.target.value), 350);
  });

  // buka modal tambah
  document.getElementById("btnTambah").addEventListener("click", () => {
    resetFormTambah();
    openModal("modalTambah");
  });

  // close buttons (semua tombol dengan data-close)
  document.querySelectorAll("[data-close]").forEach((btn) => {
    btn.addEventListener("click", () => closeModal(btn.dataset.close));
  });

  // tutup modal klik overlay
  ["modalTambah", "modalEdit", "modalHapus"].forEach((id) => {
    document.getElementById(id).addEventListener("click", (e) => {
      if (e.target.id === id) closeModal(id);
    });
  });

  // ===== SUBMIT TAMBAH =====
  formTambah.addEventListener("submit", async (e) => {
    e.preventDefault();
    const judul = document.getElementById("t_judul").value.trim();
    const pengarang = document.getElementById("t_pengarang").value.trim();
    const isbn = document.getElementById("t_isbn").value.trim();

    let valid = true;
    [["t_judul", judul], ["t_pengarang", pengarang], ["t_isbn", isbn]].forEach(([id, val]) => {
      const el = document.getElementById(id);
      if (!val) { el.classList.add("invalid"); valid = false; }
      else el.classList.remove("invalid");
    });
    if (!valid) return;

    const btn = document.getElementById("btnSubmitTambah");
    btn.disabled = true; btn.textContent = "Menyimpan...";

    try {
      await tambahBuku({
        judul,
        pengarang,
        isbn,
        genre: document.getElementById("t_genre").value.trim() || "Umum",
        tahun: document.getElementById("t_tahun").value.trim(),
        cover: document.getElementById("t_cover").value.trim(),
        deskripsi: document.getElementById("t_deskripsi").value.trim(),
      });
      closeModal("modalTambah");
      showToast(`Buku "${judul}" berhasil ditambahkan.`);
      loadBuku(searchInput.value);
    } catch (err) {
      showToast(err.message || "Gagal menambahkan buku.", true);
    } finally {
      btn.disabled = false; btn.textContent = "Tambah Buku";
    }
  });

  // ===== SUBMIT EDIT =====
  formEdit.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!selectedId) return;

    const judul = document.getElementById("e_judul").value.trim();
    const pengarang = document.getElementById("e_pengarang").value.trim();
    const status = document.getElementById("e_status").value;

    const btn = document.getElementById("btnSubmitEdit");
    btn.disabled = true; btn.textContent = "Menyimpan...";

    try {
      await editBuku(selectedId, { judul, pengarang, status });
      closeModal("modalEdit");
      showToast(`Buku berhasil diperbarui.`);
      loadBuku(searchInput.value);
    } catch (err) {
      showToast(err.message || "Gagal memperbarui buku.", true);
    } finally {
      btn.disabled = false; btn.textContent = "Simpan";
    }
  });

  // ===== KONFIRMASI HAPUS =====
  btnKonfirmasiHapus.addEventListener("click", async () => {
    if (!selectedId) return;
    btnKonfirmasiHapus.disabled = true; btnKonfirmasiHapus.textContent = "Menghapus...";

    try {
      await hapusBuku(selectedId);
      closeModal("modalHapus");
      showToast("Buku berhasil dihapus.");
      selectedId = null;
      loadBuku(searchInput.value);
    } catch (err) {
      showToast(err.message || "Gagal menghapus buku.", true);
    } finally {
      btnKonfirmasiHapus.disabled = false; btnKonfirmasiHapus.textContent = "Hapus";
    }
  });

  // ===== LOGOUT =====
  logoutBtn.addEventListener("click", (e) => {
    e.preventDefault();
    logoutModal.classList.add("show");
  });
  document.getElementById("cancelLogout").addEventListener("click", () => logoutModal.classList.remove("show"));
  document.getElementById("keluarBtn").addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("dummy_admin");
    window.location.href = "../../index.html";
  });

  loadBuku();
});