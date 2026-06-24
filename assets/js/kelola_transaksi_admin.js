// ===========================================
// kelola_transaksi.js — Logic CRUD Kelola Transaksi (Admin)
// ===========================================

let DUMMY_TRANSAKSI = [];

let activeFilter = "semua";
let selectedTransaksiId = null;

// ===== UTIL =====
function getInitials(nama) {
  return nama.split(" ").map((w) => w[0]).join("").substring(0, 2).toUpperCase();
}

function showToast(msg, isError = false) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.style.background = isError ? "#a01c1c" : "#1d3b2f";
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2500);
}

function openModal(id) { document.getElementById(id).classList.add("show"); }
function closeModal(id) { document.getElementById(id).classList.remove("show"); }

// ===== FILTER DATA =====
function getFilteredData() {
  if (activeFilter === "semua") return DUMMY_TRANSAKSI;
  return DUMMY_TRANSAKSI.filter((t) => t.status === activeFilter);
}

// ===== RENDER TABEL =====
function renderTable() {
  const tbody = document.getElementById("transaksiBody");
  const data = getFilteredData();

  if (!data || data.length === 0) {
    tbody.innerHTML = `<tr class="empty-row"><td colspan="6">Tidak ada transaksi ditemukan.</td></tr>`;
    return;
  }

  tbody.innerHTML = data.map((t) => {
    const actionBtn =
      t.status !== "selesai"
        ? `<button class="btn-kembalikan ${t.status}" data-id="${t.id}">Kembalikan</button>`
        : `<span class="dash-muted">—</span>`;

    return `
      <tr data-id="${t.id}">
        <td>
          <div class="student-cell">
            <div class="avatar-sm">${getInitials(t.studentNama)}</div>
            <span>${t.studentNama}</span>
          </div>
        </td>
        <td>${t.buku}</td>
        <td>${t.tglPinjam}</td>
        <td>${t.jatuhTempo}</td>
        <td><span class="status-pill ${t.status}">${capitalize(t.status)}</span></td>
        <td>${actionBtn}</td>
      </tr>
    `;
  }).join("");

  // event listeners for kembalikan buttons
  tbody.querySelectorAll(".btn-kembalikan").forEach((btn) => {
    btn.addEventListener("click", () => confirmKembalikan(btn.dataset.id));
  });
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ===== LOAD =====
async function loadTransaksi() {

  try {
    const result = await apiRequest("/transaksi", "GET");
    DUMMY_TRANSAKSI = result;
    renderTable();
  } catch (err) {
    showToast("Gagal memuat data transaksi.", true);
  }
}

// ===== KONFIRMASI KEMBALIKAN =====
function confirmKembalikan(id) {
  const transaksi = DUMMY_TRANSAKSI.find((t) => String(t.id) === String(id));
  if (!transaksi) return;

  selectedTransaksiId = id;

  const desc = document.getElementById("modalDesc");
  const isTerlambat = transaksi.status === "terlambat";

  desc.innerHTML = isTerlambat
    ? `Tandai pengembalian <strong>${transaksi.buku}</strong> oleh <strong>${transaksi.studentNama}</strong>?<br><span style="color:var(--warn-text);font-size:12.5px;margin-top:6px;display:block;">⚠ Transaksi ini terlambat.</span>`
    : `Tandai pengembalian <strong>${transaksi.buku}</strong> oleh <strong>${transaksi.studentNama}</strong>?`;

  openModal("modalKonfirmasi");
}

// ===== KEMBALIKAN BUKU =====
async function kembalikanBuku(id) {

  return await apiRequest(`/transaksi/${id}/kembalikan`, "PATCH", { status: "selesai" });
}

// ===== DOM READY =====
document.addEventListener("DOMContentLoaded", () => {
  // Nama admin dari localStorage
  apiRequest("/admin/profil", "GET").then(res => {
    if (res && res.nama) document.getElementById("adminName").textContent = res.nama;
  }).catch(() => {});

  // ===== FILTER TABS =====
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      activeFilter = btn.dataset.filter;
      renderTable();
    });
  });

  // ===== MODAL KONFIRMASI =====
  document.getElementById("btnBatalKonfirmasi").addEventListener("click", () => {
    closeModal("modalKonfirmasi");
    selectedTransaksiId = null;
  });

  document.getElementById("modalKonfirmasi").addEventListener("click", (e) => {
    if (e.target.id === "modalKonfirmasi") {
      closeModal("modalKonfirmasi");
      selectedTransaksiId = null;
    }
  });

  document.getElementById("btnKonfirmasiOk").addEventListener("click", async () => {
    if (!selectedTransaksiId) return;

    const btn = document.getElementById("btnKonfirmasiOk");
    btn.disabled = true;
    btn.textContent = "Menyimpan...";

    try {
      await kembalikanBuku(selectedTransaksiId);
      closeModal("modalKonfirmasi");
      showToast("Buku berhasil dikembalikan.");
      renderTable();
    } catch (err) {
      showToast("Gagal memproses pengembalian.", true);
    } finally {
      btn.disabled = false;
      btn.textContent = "Ya, Kembalikan";
      selectedTransaksiId = null;
    }
  });

  // ===== LOGOUT =====
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

  loadTransaksi();
});