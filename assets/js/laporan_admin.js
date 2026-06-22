// ===========================================
// laporan_admin.js — Logic Laporan Admin
// ===========================================

const SIMULATION_MODE = true;

// ===== DUMMY DATA =====
const DUMMY_TRANSAKSI = [
  { id: "TRX-001", anggota: "Inas Amatullah", buku: "The Great Gatsby", tglPinjam: "2026-06-01", tglKembali: "2026-06-10", status: "selesai", denda: 0 },
  { id: "TRX-002", anggota: "Budi Santoso",   buku: "Sapiens",          tglPinjam: "2026-06-03", tglKembali: "2026-06-20", status: "selesai", denda: 30000 },
  { id: "TRX-003", anggota: "Rina Dewi",      buku: "To Kill a Mocking Bird", tglPinjam: "2026-06-05", tglKembali: null, status: "aktif", denda: 0 },
  { id: "TRX-004", anggota: "Inas Amatullah", buku: "Introduction to Algorithms", tglPinjam: "2026-06-07", tglKembali: null, status: "terlambat", denda: 15000 },
  { id: "TRX-005", anggota: "Budi Santoso",   buku: "The Great Gatsby", tglPinjam: "2026-06-10", tglKembali: "2026-06-15", status: "selesai", denda: 0 },
  { id: "TRX-006", anggota: "Sari Indah",     buku: "Sapiens",          tglPinjam: "2026-06-12", tglKembali: null, status: "aktif", denda: 0 },
  { id: "TRX-007", anggota: "Ahmad Fauzi",    buku: "To Kill a Mocking Bird", tglPinjam: "2026-06-14", tglKembali: "2026-06-28", status: "selesai", denda: 45000 },
  { id: "TRX-008", anggota: "Rina Dewi",      buku: "Introduction to Algorithms", tglPinjam: "2026-06-18", tglKembali: null, status: "terlambat", denda: 10000 },
];

const DUMMY_BUKU = [
  { id: "678-0004", judul: "Sapiens: A Brief History of Humankind", pengarang: "Yuval Noah Harari", kategori: "History", isbn: "978-0771038501", status: "available" },
  { id: "678-0002", judul: "To Kill a Mocking Bird",                pengarang: "Harper Lee",          kategori: "Fiction", isbn: "978-0446310789", status: "available" },
  { id: "678-0003", judul: "The Great Gatsby",                      pengarang: "F. Scott Fitzgerald", kategori: "Fiction", isbn: "978-0743273565", status: "unavailable" },
  { id: "678-0001", judul: "Introduction to Algorithms",            pengarang: "Thomas H. Carmen",    kategori: "Science", isbn: "978-0262046305", status: "available" },
];

const DUMMY_ANGGOTA = [
  { id: "USR-001", nama: "Inas Amatullah", username: "inas.a",   email: "inas.amtllh@gmail.com",  status: "aktif" },
  { id: "USR-002", nama: "Budi Santoso",   username: "budi.s",   email: "budi.s@gmail.com",        status: "aktif" },
  { id: "USR-003", nama: "Rina Dewi",      username: "rina.d",   email: "rina.dewi@gmail.com",     status: "aktif" },
  { id: "USR-004", nama: "Sari Indah",     username: "sari.i",   email: "sari.indah@gmail.com",    status: "aktif" },
  { id: "USR-005", nama: "Ahmad Fauzi",    username: "ahmad.f",  email: "ahmad.f@gmail.com",       status: "nonaktif" },
];

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
  if (SIMULATION_MODE) {
    await new Promise(r => setTimeout(r, 200));
    const filtered = filterByDate(DUMMY_TRANSAKSI, start, end);
    const totalDenda = filtered.reduce((sum, t) => sum + (t.denda || 0), 0);
    const bukuSet = new Set(filtered.map(t => t.buku));
    return {
      totalTransaksi: filtered.length,
      bukuDipinjam:   bukuSet.size,
      anggotaAktif:   DUMMY_ANGGOTA.filter(a => a.status === "aktif").length,
      totalDenda,
    };
  }
  // MODE ASLI
  const params = new URLSearchParams();
  if (start) params.append("start", start);
  if (end)   params.append("end", end);
  return await apiRequest(`/laporan/stats?${params}`, "GET");
}

// ===== FETCH DATA TABLE =====
async function loadTableData(jenis, start, end) {
  if (SIMULATION_MODE) {
    await new Promise(r => setTimeout(r, 250));
    if (jenis === "transaksi")    return filterByDate(DUMMY_TRANSAKSI, start, end);
    if (jenis === "buku")         return DUMMY_BUKU;
    if (jenis === "anggota")      return DUMMY_ANGGOTA;
    if (jenis === "peminjaman")   return filterByDate(DUMMY_TRANSAKSI.filter(t => t.status === "aktif" || t.status === "terlambat"), start, end);
    if (jenis === "pengembalian") return filterByDate(DUMMY_TRANSAKSI.filter(t => t.status === "selesai"), start, end);
    return [];
  }
  // MODE ASLI
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
          <div class="buku-thumb">
            <svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/></svg>
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

  const rows = data.map(item => {
    if (jenis === "transaksi" || jenis === "pengembalian") {
      return [
        item.anggota || "",
        item.buku || "",
        item.tglPinjam || "",
        item.tglKembali || "",
        item.denda || 0,
      ];
    }
    if (jenis === "buku") {
      return [item.judul, item.pengarang, item.kategori, item.id, item.isbn, item.status];
    }
    if (jenis === "anggota") {
      return [item.nama, item.username, item.email, item.status];
    }
    if (jenis === "peminjaman") {
      return [item.anggota, item.buku, item.tglPinjam, item.tglKembali || "", item.status];
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
  const savedAdmin = localStorage.getItem("dummy_admin");
  if (savedAdmin) {
    try { document.getElementById("adminName").textContent = JSON.parse(savedAdmin).nama; } catch {}
  }

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