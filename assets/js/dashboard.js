// ===========================================
// dashboard.js — Logic dashboard Admin
// ===========================================



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
  // --- MODE ASLI ---
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



  loadDashboard();
});