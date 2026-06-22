// ===========================================
// riwayat.js — Logic riwayat peminjaman (Anggota)
// ===========================================

// ⚠️ SIMULASI SEMENTARA — ganti SIMULATION_MODE jadi false
// kalau backend dari temenmu sudah siap dan endpoint sudah dipasang.
const SIMULATION_MODE = true;

// status di sini mengikuti atribut status_transaksi pada class diagram:
// "dipinjam" | "terlambat" | "selesai"
const DUMMY_RIWAYAT = [
  {
    id: 1,
    judul: "Sapiens: A Brief History of Humankind",
    penulis: "Yuval Noah Harari",
    status: "dipinjam",
    tanggal_pinjam: "10/06/2026",
    jatuh_tempo: "24/06/2026",
  },
  {
    id: 2,
    judul: "Sapiens: A Brief History of Humankind",
    penulis: "Yuval Noah Harari",
    status: "terlambat",
    terlambat_hari: 6,
    denda: 30000,
  },
  {
    id: 3,
    judul: "Sapiens: A Brief History of Humankind",
    penulis: "Yuval Noah Harari",
    status: "selesai",
    tanggal_pinjam: "10/06/2026",
    tanggal_kembali: "24/06/2026",
  },
];

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
      <div class="riwayat-cover"></div>
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
  if (SIMULATION_MODE) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    allRiwayat = DUMMY_RIWAYAT;
    applyFilter(activeFilter);
    return;
  }

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
  const savedProfile = localStorage.getItem("dummy_profile");
  if (savedProfile) {
    const profile = JSON.parse(savedProfile);
    userNameEl.textContent = profile.nama || "Anggota";
  } else {
    // fallback kalau anggota belum pernah buka halaman profil di sesi ini
    userNameEl.textContent = "Inas Amatullah";
  }

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