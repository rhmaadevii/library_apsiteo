// ===========================================
// laporan_admin.js — Logic Laporan Admin
// ===========================================



// ===== ENDPOINTS (untuk mode asli) =====
// GET /laporan/stats?start=...&end=...         → { totalTransaksi, bukuDipinjam, anggotaAktif, totalDenda }
// GET /laporan/transaksi?start=...&end=...     → array transaksi
// GET /laporan/buku                            → array buku
// GET /laporan/anggota                         → array anggota
// GET /laporan/peminjaman?start=...&end=...    → array transaksi aktif/terlambat
// GET /laporan/pengembalian?start=...&end=...  → array transaksi selesai

// ===== STATE =====
let currentJenis = "transaksi";
let currentStart = null;
let currentEnd   = null;
let currentData  = [];

// ===== UTIL =====
function showToast(message, isError = false) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.style.background = isError ? "#a01c1c" : "#1d3b2f";
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2500);
}

function formatDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function formatRupiah(amount) {
  if (!amount) return null;
  return "Rp " + (amount / 1000).toFixed(0) + "k";
}

function initials(nama) {
  return nama.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase();
}

function filterByDate(data, startStr, endStr) {
  if (!startStr && !endStr) return data;
  const start = startStr ? new Date(startStr) : null;
  const end   = endStr   ? new Date(endStr)   : null;
  return data.filter(item => {
    const tgl = new Date(item.tglPinjam);
    if (start && tgl < start) return false;
    if (end   && tgl > end)   return false;
    return true;
  });
}

// ===== FETCH STATS =====
async function loadStats(start, end) {

  const params = new URLSearchParams();
  if (start) params.append("start", start);
  if (end)   params.append("end", end);
  return await apiRequest(`/laporan/stats?${params}`, "GET");
}

// ===== FETCH DATA TABLE =====
async function loadTableData(jenis, start, end) {

  const params = new URLSearchParams();
  if (start) params.append("start", start);
  if (end)   params.append("end", end);
  const endpointMap = {
    transaksi:    `/laporan/transaksi?${params}`,
    buku:         `/laporan/buku`,
    anggota:      `/laporan/anggota`,
    peminjaman:   `/laporan/peminjaman?${params}`,
    pengembalian: `/laporan/pengembalian?${params}`,
  };
  return await apiRequest(endpointMap[jenis], "GET");
}

// ===== RENDER STATS =====
function renderStats(stats) {
  document.getElementById("statTotalTransaksi").textContent = stats.totalTransaksi;
  document.getElementById("statBukuDipinjam").textContent   = stats.bukuDipinjam;
  document.getElementById("statAnggotaAktif").textContent   = stats.anggotaAktif;
  const denda = stats.totalDenda;
  document.getElementById("statTotalDenda").textContent = denda >= 1000 ? "Rp " + (denda/1000).toFixed(0) + "k" : "Rp " + denda;
}

// ===== RENDER TABLE =====
const CONFIGS = {
  transaksi: {
    title: "Laporan Transaksi",
    headers: ["No.", "Anggota", "Buku", "Tgl Pinjam", "Tgl Kembali", "Denda"],
    row: (item, i) => `
      <td>${i + 1}</td>
      <td>${item.anggota}</td>
      <td>${item.buku}</td>
      <td>${formatDate(item.tglPinjam)}</td>
      <td>${item.tglKembali ? formatDate(item.tglKembali) : '<span class="dash-muted">–</span>'}</td>
      <td>${item.denda ? '<span class="denda-text">' + formatRupiah(item.denda) + '</span>' : '<span class="dash-muted">–</span>'}</td>
    `,
  },
  buku: {
    title: "Data Buku",
    headers: ["Buku", "Kategori", "ID Buku", "ISBN", "Availability"],
    row: (item) => `
      <td>
        <div class="buku-cell">
          <div class="buku-thumb"${item.cover ? ` style="background-image: url('${item.cover}'); background-size: cover; background-position: center;"` : ''}>
            ${item.cover ? '' : `<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/></svg>`}
          </div>
          <div>
            <div class="buku-judul">${item.judul}</div>
            <div class="buku-penulis">${item.pengarang}</div>
          </div>
        </div>
      </td>
      <td><span class="badge-kategori">${item.kategori}</span></td>
      <td>${item.id}</td>
      <td>${item.isbn}</td>
      <td><span class="availability ${item.status}">${item.status === "available" ? "Available" : "Unavailable"}</span></td>
    `,
  },
  anggota: {
    title: "Data Anggota",
    headers: ["Student", "Username", "Email", "Status"],
    row: (item) => `
      <td>
        <div class="student-cell">
          <div class="avatar-sm">${initials(item.nama)}</div>
          ${item.nama}
        </div>
      </td>
      <td>${item.username}</td>
      <td>${item.email}</td>
      <td><span class="status-pill ${item.status}">${item.status.charAt(0).toUpperCase() + item.status.slice(1)}</span></td>
    `,
  },
  peminjaman: {
    title: "Transaksi Peminjaman",
    headers: ["No.", "Anggota", "Buku", "Tgl Pinjam", "Jatuh Tempo", "Status"],
    row: (item, i) => `
      <td>${i + 1}</td>
      <td>${item.anggota}</td>
      <td>${item.buku}</td>
      <td>${formatDate(item.tglPinjam)}</td>
      <td>${item.tglKembali ? formatDate(item.tglKembali) : '<span class="dash-muted">–</span>'}</td>
      <td><span class="status-pill ${item.status}">${item.status.charAt(0).toUpperCase() + item.status.slice(1)}</span></td>
    `,
  },
  pengembalian: {
    title: "Transaksi Pengembalian",
    headers: ["No.", "Anggota", "Buku", "Tgl Pinjam", "Tgl Kembali", "Denda"],
    row: (item, i) => `
      <td>${i + 1}</td>
      <td>${item.anggota}</td>
      <td>${item.buku}</td>
      <td>${formatDate(item.tglPinjam)}</td>
      <td>${formatDate(item.tglKembali)}</td>
      <td>${item.denda ? '<span class="denda-text">' + formatRupiah(item.denda) + '</span>' : '<span class="dash-muted">–</span>'}</td>
    `,
  },
};

function renderTable(jenis, data) {
  const cfg = CONFIGS[jenis];
  document.getElementById("laporanTitle").textContent = cfg.title;

  const head = document.getElementById("tableHead");
  head.innerHTML = cfg.headers.map(h => `<th>${h}</th>`).join("");

  const body = document.getElementById("tableBody");
  if (!data || data.length === 0) {
    const cols = cfg.headers.length;
    body.innerHTML = `<tr class="empty-row"><td colspan="${cols}">Tidak ada data.</td></tr>`;
    return;
  }
  body.innerHTML = data.map((item, i) => `<tr>${cfg.row(item, i)}</tr>`).join("");
  currentData = data;
}

// ===== EXPORT CSV =====
function exportCSV(jenis, data) {
  const cfg = CONFIGS[jenis];
  const headers = cfg.headers;

  const rows = data.map((item, index) => {
    if (jenis === "transaksi" || jenis === "pengembalian") {
      return [
        index + 1,
        item.anggota || "",
        item.buku || "",
        item.tglPinjam || "",
        item.tglKembali || "",
        item.denda || 0,
      ];
    }
    if (jenis === "buku") {
      return [`${item.judul} - ${item.pengarang}`, item.kategori, item.id, item.isbn, item.status];
    }
    if (jenis === "anggota") {
      return [item.nama, item.username, item.email, item.status];
    }
    if (jenis === "peminjaman") {
      return [
        index + 1,
        item.anggota || "",
        item.buku || "",
        item.tglPinjam || "",
        item.tglKembali || "",
        item.status || "",
      ];
    }
    return [];
  });

  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `laporan_${jenis}_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  showToast("Laporan berhasil diekspor.");
}

// ===== MAIN LOAD =====
async function loadAll() {
  try {
    const [stats, tableData] = await Promise.all([
      loadStats(currentStart, currentEnd),
      loadTableData(currentJenis, currentStart, currentEnd),
    ]);
    renderStats(stats);
    renderTable(currentJenis, tableData);
  } catch (err) {
    showToast("Gagal memuat data laporan.", true);
  }
}

// ===== DEFAULT DATE RANGE (bulan ini) =====
function setDefaultDates() {
  const now   = new Date();
  const year  = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
  const start = `${year}-${month}-01`;
  const end   = `${year}-${month}-${String(lastDay).padStart(2, "0")}`;
  document.getElementById("startDate").value = start;
  document.getElementById("endDate").value   = end;
  currentStart = start;
  currentEnd   = end;
}

// ===== DOMContentLoaded =====
document.addEventListener("DOMContentLoaded", () => {
  // nama admin
  apiRequest("/admin/profil", "GET").then(res => {
    if (res && res.nama) document.getElementById("adminName").textContent = res.nama;
  }).catch(() => {});

  setDefaultDates();
  loadAll();

  // jenis laporan change
  document.getElementById("jenisLaporan").addEventListener("change", (e) => {
    currentJenis = e.target.value;
    loadAll();
  });

  // date range change
  document.getElementById("startDate").addEventListener("change", (e) => {
    currentStart = e.target.value || null;
    loadAll();
  });
  document.getElementById("endDate").addEventListener("change", (e) => {
    currentEnd = e.target.value || null;
    loadAll();
  });

  // ekspor
  document.getElementById("btnEkspor").addEventListener("click", () => {
    if (!currentData || currentData.length === 0) {
      showToast("Tidak ada data untuk diekspor.", true);
      return;
    }
    exportCSV(currentJenis, currentData);
  });

  // logout
  document.getElementById("logoutBtn").addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("logoutModal").classList.add("show");
  });
  document.getElementById("cancelLogout").addEventListener("click", () => {
    document.getElementById("logoutModal").classList.remove("show");
  });
  document.getElementById("keluarBtn").addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("dummy_admin");
    window.location.href = "../../index.html";
  });
});