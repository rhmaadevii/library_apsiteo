// ===========================================
// dashboard.js — Logic dashboard Admin
// ===========================================

const SIMULATION_MODE = true;

const DUMMY_STATS = {
  totalBuku: 128,
  totalAnggota: 54,
  dipinjam: 30,
  dendaAktif: 0,
};

const DUMMY_TRANSAKSI = [
  { anggota: "Rahma", buku: "Tereliye", tanggalPinjam: "19/10/2026", status: "aktif" },
  { anggota: "Inas", buku: "The Great Gatsby", tanggalPinjam: "19/10/2026", status: "terlambat" },
  { anggota: "Siti", buku: "Love and Mom", tanggalPinjam: "19/10/2026", status: "kembali" },
  { anggota: "Rahma", buku: "Sapiens", tanggalPinjam: "15/10/2026", status: "aktif" },
  { anggota: "Budi", buku: "Laskar Pelangi", tanggalPinjam: "10/10/2026", status: "kembali" },
];

const DUMMY_ADMIN = {
  nama: "Admin Name",
};

function getStatusLabel(status) {
  if (status === "aktif") return "Aktif";
  if (status === "terlambat") return "Terlambat";
  if (status === "kembali") return "Kembali";
  return status;
}

function renderStats(stats) {
  document.getElementById("statTotalBuku").textContent = stats.totalBuku;
  document.getElementById("statTotalAnggota").textContent = stats.totalAnggota;
  document.getElementById("statDipinjam").textContent = stats.dipinjam;
  document.getElementById("statDenda").textContent = stats.dendaAktif;
}

function renderTransaksi(list) {
  const tbody = document.getElementById("transaksiBody");
  if (!list || list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:#7a7a72; padding:24px">Belum ada transaksi.</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map((item) => `
    <tr>
      <td>${item.anggota}</td>
      <td>${item.buku}</td>
      <td>${item.tanggalPinjam}</td>
      <td><span class="status-pill ${item.status}">${getStatusLabel(item.status)}</span></td>
    </tr>
  `).join("");
}

async function loadDashboard() {
  if (SIMULATION_MODE) {
    await new Promise((resolve) => setTimeout(resolve, 400));
    renderStats(DUMMY_STATS);
    renderTransaksi(DUMMY_TRANSAKSI);

    // nama admin dari localStorage kalau ada, fallback ke dummy
    const savedAdmin = localStorage.getItem("dummy_admin");
    const adminData = savedAdmin ? JSON.parse(savedAdmin) : DUMMY_ADMIN;
    document.getElementById("adminName").textContent = adminData.nama;
    return;
  }

  // --- MODE ASLI ---
  // TODO: ganti endpoint sesuai backend
  try {
    const [stats, transaksi, adminData] = await Promise.all([
      apiRequest("/admin/dashboard/stats", "GET"),
      apiRequest("/admin/dashboard/transaksi-terbaru", "GET"),
      apiRequest("/admin/profil", "GET"),
    ]);
    renderStats(stats);
    renderTransaksi(transaksi);
    document.getElementById("adminName").textContent = adminData.nama;
  } catch (err) {
    console.error("Gagal memuat dashboard:", err);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutBtn");
  const logoutModal = document.getElementById("logoutModal");
  const cancelBtn = document.getElementById("cancelBtn");
  const keluarBtn = document.getElementById("keluarBtn");

  logoutBtn.addEventListener("click", (e) => {
    e.preventDefault();
    logoutModal.classList.add("show");
  });

  cancelBtn.addEventListener("click", () => {
    logoutModal.classList.remove("show");
  });

  logoutModal.addEventListener("click", (e) => {
    if (e.target === logoutModal) logoutModal.classList.remove("show");
  });

  keluarBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("dummy_admin");
    window.location.href = "../../index.html";
  });

  // Inisialisasi data admin dummy di localStorage begitu login admin berhasil
  // (sama polanya kayak auth_anggota.js untuk anggota)
  if (!localStorage.getItem("dummy_admin")) {
    localStorage.setItem("dummy_admin", JSON.stringify(DUMMY_ADMIN));
  }

  loadDashboard();
});