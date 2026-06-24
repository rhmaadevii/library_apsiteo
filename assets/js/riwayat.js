// ===========================================
// riwayat.js — Logic riwayat peminjaman (Anggota)
// ===========================================



let allRiwayat = [];
let activeFilter = "semua";

function formatRupiah(n) {
  return "Rp" + n.toLocaleString("id-ID");
}

function getMetaText(item) {
  if (item.status === "dipinjam") {
    return `Pinjam: ${item.tanggal_pinjam} &middot; Jatuh tempo: ${item.jatuh_tempo}`;
  }
  if (item.status === "terlambat") {
    return `Terlambat ${item.terlambat_hari} hari &middot; Denda: ${formatRupiah(item.denda)}`;
  }
  if (item.status === "selesai") {
    return `Pinjam: ${item.tanggal_pinjam} &middot; Kembali: ${item.tanggal_kembali}`;
  }
  return "";
}

function getStatusLabel(status) {
  if (status === "dipinjam") return "Dipinjam";
  if (status === "terlambat") return "Terlambat";
  if (status === "selesai") return "Selesai";
  return status;
}

function renderRiwayat(items) {
  const container = document.getElementById("listContainer");
  const emptyState = document.getElementById("emptyState");

  container.innerHTML = "";

  if (items.length === 0) {
    container.appendChild(emptyState);
    emptyState.classList.add("show");
    return;
  }

  items.forEach((item) => {
    const isTerlambat = item.status === "terlambat";
    const card = document.createElement("div");
    card.className = "riwayat-card" + (isTerlambat ? " terlambat" : "");
    card.innerHTML = `
      <div class="riwayat-cover"${item.buku_cover ? ` style="background-image: url('${item.buku_cover}'); background-size: cover; background-position: center;"` : ''}></div>
      <div class="riwayat-info">
        <div class="riwayat-judul">${item.judul}</div>
        <div class="riwayat-penulis">${item.penulis}</div>
        <div class="riwayat-meta">${getMetaText(item)}</div>
      </div>
      <span class="status-pill ${item.status}">${getStatusLabel(item.status)}</span>
    `;
    container.appendChild(card);
  });
}

function applyFilter(filter) {
  activeFilter = filter;

  let filtered = allRiwayat;
  if (filter === "dipinjam") {
    // "Dipinjam" mencakup yang masih dipinjam DAN yang terlambat,
    // karena keduanya sama-sama belum dikembalikan.
    filtered = allRiwayat.filter((item) => item.status === "dipinjam" || item.status === "terlambat");
  } else if (filter === "kembali") {
    filtered = allRiwayat.filter((item) => item.status === "selesai");
  }

  renderRiwayat(filtered);
}

async function loadRiwayat() {


  // --- MODE ASLI: ambil dari backend ---
  // TODO: ganti endpoint sesuai backend, misal "/anggota/riwayat-peminjaman"
  try {
    const result = await apiRequest("/anggota/riwayat-peminjaman", "GET");
    allRiwayat = result;
    applyFilter(activeFilter);
  } catch (err) {
    console.error(err);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const tabButtons = document.querySelectorAll(".tab-btn");
  const logoutLink = document.getElementById("logoutLink");
  const userNameEl = document.getElementById("userName");

  // Nama user diambil dari data profil yang tersimpan (hasil login / edit profil),
  // BUKAN hardcode — supaya otomatis ikut akun yang sedang login.
  apiRequest("/anggota/profil", "GET").then(res => {
    userNameEl.textContent = res.nama || "Anggota";
  }).catch(() => {
    userNameEl.textContent = "Anggota";
  });

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      applyFilter(btn.dataset.filter);
    });
  });

  // Logout sekarang ditangani oleh logout-confirm.js (modal konfirmasi)

  loadRiwayat();
});